// Copyright (C) 2021 Intel Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';

import { Row, Col } from 'antd/lib/grid';
import Input from 'antd/lib/input';

import { Workspace } from 'reducers/interfaces';
import LeftGroup from './left-group';
import RightGroup from './right-group';
import PlayerNavigation from './player-navigation';
import PlayerButtons from './player-buttons';

interface Props {
    playing: boolean;
    saving: boolean;
    savingStatuses: string[];
    frameNumber: number;
    frameFilename: string;
    inputFrameRef: React.RefObject<Input>;
    startFrame: number;
    stopFrame: number;
    undoAction?: string;
    redoAction?: string;
    workspace: Workspace;
    saveShortcut: string;
    undoShortcut: string;
    redoShortcut: string;
    playPauseShortcut: string;
    nextFrameShortcut: string;
    previousFrameShortcut: string;
    forwardShortcut: string;
    backwardShortcut: string;
    prevButtonType: string;
    nextButtonType: string;
    focusFrameInputShortcut: string;
    changeWorkspace(workspace: Workspace): void;
    showStatistics(): void;
    onSwitchPlay(): void;
    onSaveAnnotation(): void;
    onPrevFrame(): void;
    onNextFrame(): void;
    onForward(): void;
    onBackward(): void;
    onFirstFrame(): void;
    onLastFrame(): void;
    setPrevButtonType(type: 'regular' | 'filtered' | 'empty'): void;
    setNextButtonType(type: 'regular' | 'filtered' | 'empty'): void;
    onSliderChange(value: number): void;
    onInputChange(value: number): void;
    onURLIconClick(): void;
    onUndoClick(): void;
    onRedoClick(): void;
    jobInstance: any;
    hideShowContextImage(): any;
}

export default function AnnotationTopBarComponent(props: Props): JSX.Element {
    const {
        saving,
        savingStatuses,
        undoAction,
        redoAction,
        playing,
        frameNumber,
        frameFilename,
        inputFrameRef,
        startFrame,
        stopFrame,
        workspace,
        saveShortcut,
        undoShortcut,
        redoShortcut,
        playPauseShortcut,
        nextFrameShortcut,
        previousFrameShortcut,
        forwardShortcut,
        backwardShortcut,
        prevButtonType,
        nextButtonType,
        focusFrameInputShortcut,
        showStatistics,
        changeWorkspace,
        onSwitchPlay,
        onSaveAnnotation,
        onPrevFrame,
        onNextFrame,
        onForward,
        onBackward,
        onFirstFrame,
        onLastFrame,
        setPrevButtonType,
        setNextButtonType,
        onSliderChange,
        onInputChange,
        onURLIconClick,
        onUndoClick,
        onRedoClick,
        jobInstance,
    } = props;

    return (
        <Row justify='space-between'>
            <LeftGroup
                saving={saving}
                savingStatuses={savingStatuses}
                undoAction={undoAction}
                redoAction={redoAction}
                saveShortcut={saveShortcut}
                undoShortcut={undoShortcut}
                redoShortcut={redoShortcut}
                onSaveAnnotation={onSaveAnnotation}
                onUndoClick={onUndoClick}
                onRedoClick={onRedoClick}
            />
            <Col className='cvat-annotation-header-player-group'>
                <Row align='middle'>
                    <PlayerButtons
                        playing={playing}
                        playPauseShortcut={playPauseShortcut}
                        nextFrameShortcut={nextFrameShortcut}
                        previousFrameShortcut={previousFrameShortcut}
                        forwardShortcut={forwardShortcut}
                        backwardShortcut={backwardShortcut}
                        prevButtonType={prevButtonType}
                        nextButtonType={nextButtonType}
                        onPrevFrame={onPrevFrame}
                        onNextFrame={onNextFrame}
                        onForward={onForward}
                        onBackward={onBackward}
                        onFirstFrame={onFirstFrame}
                        onLastFrame={onLastFrame}
                        onSwitchPlay={onSwitchPlay}
                        setPrevButton={setPrevButtonType}
                        setNextButton={setNextButtonType}
                    />
                    <PlayerNavigation
                        startFrame={startFrame}
                        stopFrame={stopFrame}
                        frameNumber={frameNumber}
                        frameFilename={frameFilename}
                        focusFrameInputShortcut={focusFrameInputShortcut}
                        inputFrameRef={inputFrameRef}
                        onSliderChange={onSliderChange}
                        onInputChange={onInputChange}
                        onURLIconClick={onURLIconClick}
                    />
                </Row>
            </Col>
            <RightGroup
                jobInstance={jobInstance}
                workspace={workspace}
                changeWorkspace={changeWorkspace}
                showStatistics={showStatistics}
            />
        </Row>
    );
}
