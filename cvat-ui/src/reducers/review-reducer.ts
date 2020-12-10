// Copyright (C) 2020 Intel Corporation
//
// SPDX-License-Identifier: MIT

import consts from 'consts';
import { AnnotationActionTypes } from 'actions/annotation-actions';
import { ReviewActionTypes } from 'actions/review-actions';
import { AuthActionTypes } from 'actions/auth-actions';
import { ReviewState } from './interfaces';

const defaultState: ReviewState = {
    reviews: [], // saved on the server
    issues: [], // saved on the server
    latestComments: [],
    frameIssues: [], // saved on the server and not saved on the server
    activeReview: null, // not saved on the server
    newIssuePosition: null,
    issuesHidden: false,
    fetching: {
        reviewId: null,
        issueId: null,
    },
};

function computeFrameIssues(issues: any[], activeReview: any, frame: number): any[] {
    const combinedIssues = activeReview ? issues.concat(activeReview.issues) : issues;
    return combinedIssues.filter((issue: any): boolean => issue.frame === frame);
}

export default function (state: ReviewState = defaultState, action: any): ReviewState {
    switch (action.type) {
        case AnnotationActionTypes.GET_JOB_SUCCESS: {
            const {
                reviews,
                issues,
                frameData: { number: frame },
            } = action.payload;
            const frameIssues = computeFrameIssues(issues, state.activeReview, frame);

            return {
                ...state,
                reviews,
                issues,
                frameIssues,
            };
        }
        case AnnotationActionTypes.CHANGE_FRAME: {
            return {
                ...state,
                newIssuePosition: null,
            };
        }
        case ReviewActionTypes.SUBMIT_REVIEW: {
            const { reviewId } = action.payload;
            return {
                ...state,
                fetching: {
                    ...state.fetching,
                    reviewId,
                },
            };
        }
        case ReviewActionTypes.SUBMIT_REVIEW_SUCCESS: {
            return {
                ...state,
                fetching: {
                    ...state.fetching,
                    reviewId: null,
                },
            };
        }
        case ReviewActionTypes.SUBMIT_REVIEW_FAILED: {
            return {
                ...state,
                fetching: {
                    ...state.fetching,
                    reviewId: null,
                },
            };
        }
        case AnnotationActionTypes.CHANGE_FRAME_SUCCESS: {
            const { number: frame } = action.payload;
            return {
                ...state,
                frameIssues: computeFrameIssues(state.issues, state.activeReview, frame),
            };
        }
        case ReviewActionTypes.INITIALIZE_REVIEW_SUCCESS: {
            const { reviewInstance, frame } = action.payload;
            const frameIssues = computeFrameIssues(state.issues, reviewInstance, frame);

            return {
                ...state,
                activeReview: reviewInstance,
                frameIssues,
            };
        }
        case ReviewActionTypes.START_ISSUE: {
            const { position } = action.payload;
            return {
                ...state,
                newIssuePosition: position,
            };
        }
        case ReviewActionTypes.FINISH_ISSUE_SUCCESS: {
            const { frame, issue } = action.payload;
            const frameIssues = computeFrameIssues(state.issues, state.activeReview, frame);

            return {
                ...state,
                latestComments: state.latestComments.includes(issue.comments[0].message) ?
                    state.latestComments :
                    Array.from(
                        new Set(
                            [...state.latestComments, issue.comments[0].message].filter(
                                (message: string): boolean =>
                                    ![
                                        consts.QUICK_ISSUE_INCORRECT_POSITION_TEXT,
                                        consts.QUICK_ISSUE_INCORRECT_ATTRIBUTE_TEXT,
                                    ].includes(message),
                            ),
                        ),
                    ).slice(-consts.LATEST_COMMENTS_SHOWN_QUICK_ISSUE),
                frameIssues,
                newIssuePosition: null,
            };
        }
        case ReviewActionTypes.CANCEL_ISSUE: {
            return {
                ...state,
                newIssuePosition: null,
            };
        }
        case ReviewActionTypes.COMMENT_ISSUE:
        case ReviewActionTypes.RESOLVE_ISSUE:
        case ReviewActionTypes.REOPEN_ISSUE: {
            const { issueId } = action.payload;
            return {
                ...state,
                fetching: {
                    ...state.fetching,
                    issueId,
                },
            };
        }
        case ReviewActionTypes.COMMENT_ISSUE_FAILED:
        case ReviewActionTypes.RESOLVE_ISSUE_FAILED:
        case ReviewActionTypes.REOPEN_ISSUE_FAILED: {
            return {
                ...state,
                fetching: {
                    ...state.fetching,
                    issueId: null,
                },
            };
        }
        case ReviewActionTypes.RESOLVE_ISSUE_SUCCESS:
        case ReviewActionTypes.REOPEN_ISSUE_SUCCESS:
        case ReviewActionTypes.COMMENT_ISSUE_SUCCESS: {
            const { issues, frameIssues } = state;

            return {
                ...state,
                issues: [...issues],
                frameIssues: [...frameIssues],
                fetching: {
                    ...state.fetching,
                    issueId: null,
                },
            };
        }
        case ReviewActionTypes.SWITCH_ISSUES_HIDDEN_FLAG: {
            const { hidden } = action.payload;
            return {
                ...state,
                issuesHidden: hidden,
            };
        }
        case AnnotationActionTypes.CLOSE_JOB:
        case AuthActionTypes.LOGOUT_SUCCESS: {
            return { ...defaultState };
        }
        default:
            return state;
    }

    return state;
}
