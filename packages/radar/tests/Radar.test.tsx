import { mount } from 'enzyme'
// @ts-ignore
import { Radar, RadarSvgProps } from '../src'
import { RadarSliceTooltipProps } from '../dist/types'

type TestDatum = {
    A: number
    B: number
    category: string
}

const baseProps: RadarSvgProps<TestDatum> = {
    width: 500,
    height: 300,
    data: [
        { A: 10, B: 20, category: 'first' },
        { A: 20, B: 30, category: 'second' },
        { A: 30, B: 10, category: 'third' },
    ],
    keys: ['A', 'B'],
    indexBy: 'category',
    animate: false,
}

it('should render a basic radar chart', () => {
    const wrapper = mount(<Radar<TestDatum> {...baseProps} />)

    const layers = wrapper.find('RadarLayer')
    expect(layers).toHaveLength(2)

    const layer0 = layers.at(0)
    expect(layer0.prop('item')).toBe('A')
    const layer0path = layer0.find('path')
    expect(layer0path.prop('fill')).toBe('rgba(232, 193, 160, 1)')

    const layer1 = layers.at(1)
    expect(layer1.prop('item')).toBe('B')
    const layer1path = layer1.find('path')
    expect(layer1path.prop('fill')).toBe('rgba(244, 117, 96, 1)')
})

describe('data', () => {
    it('should support value formatting', () => {
        const wrapper = mount(
            <Radar<TestDatum> {...baseProps} valueFormat={value => `${value}%`} />
        )

        wrapper.find('RadarSlice').at(0).find('path').simulate('mouseenter')

        const tooltip = wrapper.find('RadarSliceTooltip')
        const data = tooltip.prop<RadarSliceTooltipProps['data']>('data')
        expect(data[0].formattedValue).toEqual('20%')
        expect(data[1].formattedValue).toEqual('10%')
    })

    it('should support value formatting depending on the key', () => {
        const wrapper = mount(
            <Radar<TestDatum> {...baseProps} valueFormat={(value, key) => `${value} ${key}s`} />
        )

        wrapper.find('RadarSlice').at(2).find('path').simulate('mouseenter')

        const tooltip = wrapper.find('RadarSliceTooltip')
        const data = tooltip.prop<RadarSliceTooltipProps['data']>('data')
        expect(data[0].formattedValue).toEqual('30 As')
        expect(data[1].formattedValue).toEqual('10 Bs')
    })
})

describe('tooltip', () => {
    it('should show a tooltip with index and corresponding values', () => {
        const wrapper = mount(<Radar<TestDatum> {...baseProps} />)

        const slices = wrapper.find('RadarSlice')
        expect(slices).toHaveLength(3)

        const slice0 = slices.at(0)
        expect(slice0.prop('index')).toBe('first')

        slice0.find('path').simulate('mouseenter')
        let tooltip = wrapper.find('RadarSliceTooltip')
        expect(tooltip.text()).toBe(['first', 'B', 20, 'A', 10].join(''))

        const slice1 = slices.at(1)
        expect(slice1.prop('index')).toBe('second')

        slice1.find('path').simulate('mouseenter')
        tooltip = wrapper.find('RadarSliceTooltip')
        expect(tooltip.text()).toBe(['second', 'B', 30, 'A', 20].join(''))

        const slice2 = slices.at(2)
        expect(slice2.prop('index')).toBe('third')

        slice2.find('path').simulate('mouseenter')
        tooltip = wrapper.find('RadarSliceTooltip')
        expect(tooltip.text()).toBe(['third', 'A', 30, 'B', 10].join(''))
    })

    it('should support a custom slice tooltip', () => {
        const CustomSliceTooltip = ({ index, data }: RadarSliceTooltipProps) => (
            <div>
                {index}: {data.map(d => `${d.id} -> ${d.value} (${d.color})`).join(', ')}
            </div>
        )

        const wrapper = mount(<Radar<TestDatum> {...baseProps} sliceTooltip={CustomSliceTooltip} />)

        wrapper.find('RadarSlice').at(1).find('path').simulate('mouseenter')

        const tooltip = wrapper.find('CustomSliceTooltip')
        expect(tooltip.exists()).toBe(true)
        expect(tooltip.text()).toBe('second: B -> 30 (#f47560), A -> 20 (#e8c1a0)')
    })
})

describe('style', () => {
    it('custom colors array', () => {
        const colors = ['rgba(255, 0, 0, 1)', 'rgba(0, 0, 255, 1)']
        const wrapper = mount(<Radar {...baseProps} colors={colors} />)

        expect(wrapper.find('RadarLayer').at(0).find('path').prop('fill')).toBe(colors[0])
        expect(wrapper.find('RadarLayer').at(1).find('path').prop('fill')).toBe(colors[1])
    })

    it('custom colors function', () => {
        const colorMapping = {
            A: 'rgba(255, 0, 0, 1)',
            B: 'rgba(0, 0, 255, 1)',
        }
        const wrapper = mount(
            <Radar<TestDatum>
                {...baseProps}
                colors={d => colorMapping[d.key as keyof typeof colorMapping]}
            />
        )

        expect(wrapper.find('RadarLayer').at(0).find('path').prop('fill')).toBe(colorMapping.A)
        expect(wrapper.find('RadarLayer').at(1).find('path').prop('fill')).toBe(colorMapping.B)
    })
})

describe('accessibility', () => {
    it('should forward root aria properties to the SVG element', () => {
        const wrapper = mount(
            <Radar<TestDatum>
                {...baseProps}
                ariaLabel="AriaLabel"
                ariaLabelledBy="AriaLabelledBy"
                ariaDescribedBy="AriaDescribedBy"
            />
        )

        const svg = wrapper.find('svg')

        expect(svg.prop('aria-label')).toBe('AriaLabel')
        expect(svg.prop('aria-labelledby')).toBe('AriaLabelledBy')
        expect(svg.prop('aria-describedby')).toBe('AriaDescribedBy')
    })
})
