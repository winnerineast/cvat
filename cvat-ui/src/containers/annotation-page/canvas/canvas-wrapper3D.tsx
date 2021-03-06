// Copyright (C) 2021 Intel Corporation
//
// SPDX-License-Identifier: MIT

import { connect } from 'react-redux';

import CanvasWrapperComponent from 'components/annotation-page/canvas/canvas-wrapper3D';
import { confirmCanvasReady, getContextImage } from 'actions/annotation-actions';

import { CombinedState } from 'reducers/interfaces';

import { Canvas3d } from 'cvat-canvas3d-wrapper';

interface StateToProps {
    canvasInstance: Canvas3d;
    jobInstance: any;
    frameData: any;
    curZLayer: number;
    contextImageHide: boolean;
    loaded: boolean;
    data: string;
    annotations: any[];
}

interface DispatchToProps {
    onSetupCanvas(): void;
    getContextImage(): void;
}

function mapStateToProps(state: CombinedState): StateToProps {
    const {
        annotation: {
            canvas: { instance: canvasInstance },
            job: { instance: jobInstance },
            player: {
                frame: { data: frameData },
                contextImage: { hidden: contextImageHide, data, loaded },
            },
            annotations: {
                states: annotations,
                zLayer: { cur: curZLayer },
            },
        },
    } = state;

    return {
        canvasInstance,
        jobInstance,
        frameData,
        curZLayer,
        contextImageHide,
        loaded,
        data,
        annotations,
    };
}

function mapDispatchToProps(dispatch: any): DispatchToProps {
    return {
        onSetupCanvas(): void {
            dispatch(confirmCanvasReady());
        },
        getContextImage(): void {
            dispatch(getContextImage());
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(CanvasWrapperComponent);
