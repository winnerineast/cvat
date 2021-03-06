// Copyright (C) 2021 Intel Corporation
//
// SPDX-License-Identifier: MIT

import { numberArrayToPoints, pointsToNumberArray, Point } from '../math';

export interface IntelligentScissorsParams {
    shape: {
        shapeType: 'polygon' | 'polyline';
    };
    canvas: {
        shapeType: 'points';
        enableThreshold: boolean;
        enableSliding: boolean;
        allowRemoveOnlyLast: boolean;
        minPosVertices: number;
    };
}

export interface IntelligentScissors {
    reset(): void;
    run(points: number[], image: ImageData, offsetX: number, offsetY: number): number[];
    params: IntelligentScissorsParams;
}

function applyOffset(points: Point[], offsetX: number, offsetY: number): Point[] {
    return points.map(
        (point: Point): Point => ({
            x: point.x - offsetX,
            y: point.y - offsetY,
        }),
    );
}

export default class IntelligentScissorsImplementation implements IntelligentScissors {
    private cv: any;
    private scissors: {
        tool: any;
        state: {
            path: number[];
            anchors: Record<
            number,
            {
                point: Point;
                start: number;
            }
            >; // point index : start index in path
            image: any | null;
        };
    };

    public constructor(cv: any) {
        this.cv = cv;
        this.reset();
    }

    public reset(): void {
        if (this.scissors && this.scissors.tool) {
            this.scissors.tool.delete();
        }

        this.scissors = {
            // eslint-disable-next-line new-cap
            tool: new this.cv.segmentation_IntelligentScissorsMB(),
            state: {
                path: [],
                anchors: {},
                image: null,
            },
        };

        this.scissors.tool.setEdgeFeatureCannyParameters(32, 100);
        this.scissors.tool.setGradientMagnitudeMaxLimit(200);
    }

    public run(coordinates: number[], image: ImageData, offsetX: number, offsetY: number): number[] {
        if (!Array.isArray(coordinates)) {
            throw new Error('Coordinates is expected to be an array');
        }
        if (!coordinates.length) {
            throw new Error('At least one point is expected');
        }
        if (!(image instanceof ImageData)) {
            throw new Error('Image is expected to be an instance of ImageData');
        }

        const { cv, scissors } = this;
        const { tool, state } = scissors;

        const points = applyOffset(numberArrayToPoints(coordinates), offsetX, offsetY);

        if (points.length > 1) {
            let matImage = null;
            const contour = new cv.Mat();
            const approx = new cv.Mat();

            try {
                const [prev, cur] = points.slice(-2);
                const { x: prevX, y: prevY } = prev;
                const { x: curX, y: curY } = cur;

                const latestPointRemoved = points.length < Object.keys(state.anchors).length;
                const latestPointReplaced = points.length === Object.keys(state.anchors).length;

                if (latestPointRemoved) {
                    for (const i of Object.keys(state.anchors).sort((a, b) => +b - +a)) {
                        if (+i >= points.length) {
                            state.path = state.path.slice(0, state.anchors[points.length].start);
                            delete state.anchors[+i];
                        }
                    }

                    return [...state.path];
                }

                matImage = cv.matFromImageData(image);

                if (latestPointReplaced) {
                    state.path = state.path.slice(0, state.anchors[points.length - 1].start);
                    delete state.anchors[points.length - 1];
                }

                tool.applyImage(matImage);
                tool.buildMap(new cv.Point(prevX, prevY));
                tool.getContour(new cv.Point(curX, curY), contour);
                cv.approxPolyDP(contour, approx, 2, false);

                const pathSegment = [];
                for (let row = 0; row < approx.rows; row++) {
                    pathSegment.push(approx.intAt(row, 0) + offsetX, approx.intAt(row, 1) + offsetY);
                }
                state.anchors[points.length - 1] = {
                    point: cur,
                    start: state.path.length,
                };
                state.path.push(...pathSegment);
            } finally {
                if (matImage) {
                    matImage.delete();
                }

                contour.delete();
                approx.delete();
            }
        } else {
            state.path.push(...pointsToNumberArray(applyOffset(points.slice(-1), -offsetX, -offsetY)));
            state.anchors[0] = {
                point: points[0],
                start: 0,
            };
        }

        return [...state.path];
    }

    // eslint-disable-next-line class-methods-use-this
    public get type(): string {
        return 'opencv_intelligent_scissors';
    }

    // eslint-disable-next-line class-methods-use-this
    public get params(): IntelligentScissorsParams {
        return {
            shape: {
                shapeType: 'polygon',
            },
            canvas: {
                shapeType: 'points',
                enableThreshold: true,
                enableSliding: true,
                allowRemoveOnlyLast: true,
                minPosVertices: 1,
            },
        };
    }
}
