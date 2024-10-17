import { useCallback, useMemo } from 'react'

interface TrackSelectionProps {
  trackNamesMap: Map<number, string>
  onTrackSelectionChange: (selectedTracks: number[]) => void
  selectedTracks: number[]
}

const firstColumn = [0, 1, 2]
const secondColumn = [10, 11, 12, 13, 14, 15]
const fourthColumn = [30, 31, 32, 33, 34]
const thirdColumn = [20, 21]
const orderedTracks = [
  ...firstColumn,
  ...secondColumn,
  ...thirdColumn,
  ...fourthColumn,
]
export const TrackSelection = ({
  trackNamesMap,
  onTrackSelectionChange,
  selectedTracks,
}: TrackSelectionProps) => {
  //due to hardcoded ids to achieve a specific order we have to make sure to have a catch all to capture the possibility of uncaught ids
  const columnArrays = useMemo(() => {
    const remainingTracks = Array.from(trackNamesMap.keys()).filter(
      (trackId) => !orderedTracks.includes(trackId),
    )

    return [
      firstColumn,
      secondColumn,
      thirdColumn,
      fourthColumn,
      remainingTracks,
    ]
  }, [trackNamesMap])

  const addTrackToSelection = useCallback(
    (trackId: number) => {
      const newSelection = [...selectedTracks, trackId]
      onTrackSelectionChange(newSelection)
    },
    [onTrackSelectionChange, selectedTracks],
  )

  const removeTrackFromSelection = useCallback(
    (trackId: number) => {
      const newSelection = selectedTracks.filter((id) => id !== trackId)
      onTrackSelectionChange(newSelection)
    },
    [onTrackSelectionChange, selectedTracks],
  )

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-wrap">
        {columnArrays.map((column, columnIndex) => (
          <div key={columnIndex} className="min-w-[180px] px-2 md:w-1/4">
            <div className="flex flex-col">
              {column.map((trackId) => {
                const item = trackNamesMap.get(trackId)
                const isSelected = selectedTracks.includes(trackId)
                if (!item) return null
                return (
                  <div key={trackId} className="mb-2 min-h-[3rem] p-2 text-xs">
                    <input
                      type="checkbox"
                      id={trackId.toString()}
                      className="self-start accent-[hsl(var(--primary))]"
                      checked={isSelected}
                      onChange={() =>
                        isSelected
                          ? removeTrackFromSelection(trackId)
                          : addTrackToSelection(trackId)
                      }
                    />
                    <label
                      htmlFor={trackId.toString()}
                      className="ml-2 cursor-pointer"
                    >{`${trackId} - ${item}`}</label>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
