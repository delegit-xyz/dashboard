import {
  forwardRef,
  ElementRef,
  ComponentPropsWithoutRef,
  Fragment,
} from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'
import { cn } from '@/lib/utils'
import clsx from 'clsx'

interface ExtraSliderProps
  extends ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  labelPosition?: 'top' | 'bottom'
  label?: (value: number | undefined) => React.ReactNode
  marks?: boolean
  marksLabels?: string[]
  marksPreFix?: string
  marksPostFix?: string
}

const Slider = forwardRef<
  ElementRef<typeof SliderPrimitive.Root>,
  ExtraSliderProps
>(
  (
    {
      className,
      label,
      labelPosition = 'top',
      marks,
      marksLabels,
      marksPreFix,
      marksPostFix,
      ...props
    },
    ref,
  ) => {
    const initialValue = Array.isArray(props.value)
      ? props.value
      : [props.min, props.max]
    return (
      <>
        <SliderPrimitive.Root
          ref={ref}
          className={cn(
            'relative flex w-full cursor-pointer touch-none items-center select-none',
            className,
          )}
          {...props}
        >
          <SliderPrimitive.Track className="bg-secondary relative h-2 w-full grow overflow-hidden rounded-full">
            <SliderPrimitive.Range className="bg-primary absolute h-full" />
          </SliderPrimitive.Track>
          {initialValue.map((value, index) => (
            <Fragment key={index}>
              <SliderPrimitive.Thumb className="border-primary bg-background ring-offset-background focus-visible:ring-ring relative block h-4 w-4 rounded-full border-2 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50">
                {!marks && label && (
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
        {marks ? (
          <div
            className={cn(
              'relative flex flex-row justify-between',
              labelPosition === 'top' && 'top-[-4.5rem]',
              labelPosition === 'bottom' && 'top-[-1rem]',
            )}
          >
            {props?.max &&
              Array.from({ length: props?.max + 1 }).map((_, i) => {
                const k: string = marksLabels ? marksLabels[i] : i.toString()
                return (
                  <span
                    key={`${props?.max}-${i}`}
                    className={
                      props?.max
                        ? clsx(
                            'text-sm',
                            props.value && parseInt(k) !== props.value[0]
                              ? 'font-light opacity-40'
                              : 'font-bold',
                            {
                              'text-10': i > 0 && i < props?.max,
                            },
                          )
                        : ''
                    }
                    role="presentation"
                  >
                    {marksPreFix}
                    {k}
                    {marksPostFix}
                  </span>
                )
              })}
          </div>
        ) : null}
      </>
    )
  },
)
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
