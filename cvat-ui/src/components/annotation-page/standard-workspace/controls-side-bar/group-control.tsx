// Copyright (C) 2020-2021 Intel Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';
import Icon from '@ant-design/icons';

import { GroupIcon } from 'icons';
import { Canvas } from 'cvat-canvas-wrapper';
import { ActiveControl } from 'reducers/interfaces';
import CVATTooltip from 'components/common/cvat-tooltip';

export interface Props {
    canvasInstance: Canvas;
    activeControl: ActiveControl;
    switchGroupShortcut: string;
    resetGroupShortcut: string;
    groupObjects(enabled: boolean): void;
}

function GroupControl(props: Props): JSX.Element {
    const {
        switchGroupShortcut, resetGroupShortcut, activeControl, canvasInstance, groupObjects,
    } = props;

    const dynamicIconProps =
        activeControl === ActiveControl.GROUP ?
            {
                className: 'cvat-group-control cvat-active-canvas-control',
                onClick: (): void => {
                    canvasInstance.group({ enabled: false });
                    groupObjects(false);
                },
            } :
            {
                className: 'cvat-group-control',
                onClick: (): void => {
                    canvasInstance.cancel();
                    canvasInstance.group({ enabled: true });
                    groupObjects(true);
                },
            };

    const title = [
        `Group shapes/tracks ${switchGroupShortcut}. `,
        `Select and press ${resetGroupShortcut} to reset a group.`,
    ].join(' ');

    return (
        <CVATTooltip title={title} placement='right'>
            <Icon {...dynamicIconProps} component={GroupIcon} />
        </CVATTooltip>
    );
}

export default React.memo(GroupControl);
