import {
  forwardRef,
  ElementRef,
  ComponentPropsWithoutRef,
  Fragment,
} from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'

import { cn } from '@/lib/utils'

// const labels = [0, 1, 2, 3, 4, 5, 6]

interface ExtraSliderProps
  extends ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  labelPosition?: 'top' | 'bottom'
  label?: (value: number | undefined) => React.ReactNode
}

// const calculateCumulativePercentages = (values: number[]): number[] => {
//   const total = values.reduce((acc, value) => acc + value, 0)
//   const percentages = values.map((value) => (value / total) * 100)

//   const cumulativePercentages: number[] = []
//   percentages.reduce((acc, percent) => {
//     cumulativePercentages.push(acc + percent)
//     return acc + percent
//   }, 0)

//   return cumulativePercentages
// }

const Slider = forwardRef<
  ElementRef<typeof SliderPrimitive.Root>,
  ExtraSliderProps
>(({ className, label, labelPosition = 'top', ...props }, ref) => {
  // const positions = calculateCumulativePercentages(labels)

  const initialValue = Array.isArray(props.value)
    ? props.value
    : [props.min, props.max]
  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        'relative flex w-full touch-none select-none items-center',
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
        <SliderPrimitive.Range className="absolute h-full bg-primary" />
      </SliderPrimitive.Track>
      {initialValue.map((value, index) => (
        <Fragment key={index}>
          <SliderPrimitive.Thumb className="relative block h-4 w-4 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
            {label && (
              <span
                className={cn(
                  'absolute flex w-full justify-center',
                  labelPosition === 'top' && '-top-7',
                  labelPosition === 'bottom' && 'top-4',
                )}
              >
                {label(value)}
              </span>
            )}
          </SliderPrimitive.Thumb>
        </Fragment>
      ))}
    </SliderPrimitive.Root>
  )
})
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
