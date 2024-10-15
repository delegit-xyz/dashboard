import { useState, useEffect } from 'react';

interface TrackSelectionProps {
    trackNamesMap: Map<number, string>;
    onTrackSelectionChange: (selectedTracks: number[]) => void;
}

const TrackSelection: React.FC<TrackSelectionProps> = ({ trackNamesMap, onTrackSelectionChange }) => {
    const [selectedTracks, setSelectedTracks] = useState<number[]>([])

    useEffect(() => {
        onTrackSelectionChange(selectedTracks);
    }, [selectedTracks, onTrackSelectionChange]);


    useEffect(() => {
        if (trackNamesMap.size > 0) {
            const allTrackIds = Array.from(trackNamesMap.keys())
            setSelectedTracks(allTrackIds)
        }
    }, [trackNamesMap]);

    const handleTrackToggle = (selectedTrackId: number) => {
        setSelectedTracks((prevSelectedTracks) => {
            if (prevSelectedTracks.includes(selectedTrackId)) {
                return prevSelectedTracks.filter((id) => id !== selectedTrackId);
            } else {
                return [...prevSelectedTracks, selectedTrackId];
            }
        });
    };

    const firstColumn = [0, 2, 20, 21]
    const secondColumn = [12, 15, 11, 14, 10]
    const thirdColumn = [30, 31, 32, 33, 34]
    const fourthColumn = [1, 13]

    //due to hardcoded ids to achieve a specific order we have to make sure to have a catch all to capture the possibility of uncaught ids
    const orderedTracks = [...firstColumn, ...secondColumn, ...thirdColumn, ...fourthColumn];
    const availableTracks = Array.from(trackNamesMap.keys());
    const remainingTracks = availableTracks.filter(trackId => !orderedTracks.includes(trackId));

    const columnArrays = [firstColumn, secondColumn, thirdColumn, fourthColumn, remainingTracks]


    return (
        <div className="container mx-auto p-4">
            <div className="flex flex-wrap">
                {columnArrays.map((column, columnIndex) => (
                    <div key={columnIndex} className="sm:w-1/2 md:w-1/4 px-2 min-w-[180px]">
                        <div className="flex flex-col">
                            {column.map((trackId) => {
                                const item = trackNamesMap.get(trackId)
                                if (!item) return null
                                return (
                                    <div
                                        key={trackId}
                                        className="flex-grow p-2 mb-2 min-h-[3rem] items-start"
                                    >
                                        <div className="flex">
                                            <label className="flex items-center space-x-2 text-xs">
                                                <input
                                                    type="checkbox"
                                                    className="accent-[hsl(var(--primary))] self-start"
                                                    checked={selectedTracks.includes(trackId)}
                                                    onChange={() => handleTrackToggle(trackId)}
                                                />

                                                <span> {trackNamesMap.get(trackId)} </span>
                                            </label>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )

};

export default TrackSelection;
