import { createElement, Fragment, ReactNode } from 'react'
import { Container, useDimensions, SvgWrapper } from '@nivo/core'
import { RadialBarLayerId, RadialBarSvgProps } from './types'
import { svgDefaultProps } from './props'
import { useRadialBar } from './hooks'
import { RadialBarArcs } from './RadialBarArcs'
import { PolarGrid } from './PolarGrid'

type InnerRadialBarProps = Omit<
    RadialBarSvgProps,
    'animate' | 'motionConfig' | 'renderWrapper' | 'theme'
>

const InnerRadialBar = ({
    data,
    startAngle = svgDefaultProps.startAngle,
    endAngle = svgDefaultProps.endAngle,
    width,
    height,
    margin: partialMargin,
    layers = svgDefaultProps.layers,
    colors = svgDefaultProps.colors,
    cornerRadius = svgDefaultProps.cornerRadius,
    isInteractive = svgDefaultProps.isInteractive,
    tooltip = svgDefaultProps.tooltip,
    onClick,
    onMouseEnter,
    onMouseMove,
    onMouseLeave,
    role,
    ariaLabel,
    ariaLabelledBy,
    ariaDescribedBy,
}: InnerRadialBarProps) => {
    const { margin, innerWidth, innerHeight, outerWidth, outerHeight } = useDimensions(
        width,
        height,
        partialMargin
    )

    const { center, bars, arcGenerator, radiusScale, valueScale } = useRadialBar({
        data,
        startAngle,
        endAngle,
        width: innerWidth,
        height: innerHeight,
        colors,
        cornerRadius,
    })

    const layerById: Record<RadialBarLayerId, ReactNode> = {
        grid: null,
        bars: null,
        legends: null,
    }

    if (layers.includes('grid')) {
        layerById.grid = (
            <PolarGrid
                key="grid"
                center={center}
                angleScale={valueScale}
                radiusScale={radiusScale}
            />
        )
    }

    if (layers.includes('bars')) {
        layerById.bars = (
            <g key="bars" transform={`translate(${center[0]}, ${center[1]})`}>
                <RadialBarArcs
                    bars={bars}
                    arcGenerator={arcGenerator}
                    isInteractive={isInteractive}
                    tooltip={tooltip}
                    onClick={onClick}
                    onMouseEnter={onMouseEnter}
                    onMouseMove={onMouseMove}
                    onMouseLeave={onMouseLeave}
                />
            </g>
        )
    }

    return (
        <SvgWrapper
            width={outerWidth}
            height={outerHeight}
            margin={margin}
            role={role}
            ariaLabel={ariaLabel}
            ariaLabelledBy={ariaLabelledBy}
            ariaDescribedBy={ariaDescribedBy}
        >
            {layers.map((layer, i) => {
                if (typeof layer === 'function') {
                    return <Fragment key={i}>{createElement(layer, {})}</Fragment>
                }

                return layerById?.[layer] ?? null
            })}
        </SvgWrapper>
    )
}

export const RadialBar = ({
    isInteractive = svgDefaultProps.isInteractive,
    animate = svgDefaultProps.animate,
    motionConfig = svgDefaultProps.motionConfig,
    theme,
    renderWrapper,
    ...otherProps
}: RadialBarSvgProps) => (
    <Container
        {...{
            animate,
            isInteractive,
            motionConfig,
            renderWrapper,
            theme,
        }}
    >
        <InnerRadialBar isInteractive={isInteractive} {...otherProps} />
    </Container>
)
