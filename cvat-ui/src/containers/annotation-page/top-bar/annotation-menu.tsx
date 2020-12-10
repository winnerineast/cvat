// Copyright (C) 2020 Intel Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { connect } from 'react-redux';
// eslint-disable-next-line import/no-extraneous-dependencies
import { MenuInfo } from 'rc-menu/lib/interface';

import { CombinedState, TaskStatus } from 'reducers/interfaces';
import AnnotationMenuComponent, { Actions } from 'components/annotation-page/top-bar/annotation-menu';
import { dumpAnnotationsAsync, exportDatasetAsync, updateJobAsync } from 'actions/tasks-actions';
import {
    uploadJobAnnotationsAsync,
    removeAnnotationsAsync,
    saveAnnotationsAsync,
    switchRequestReviewDialog as switchRequestReviewDialogAction,
    switchSubmitReviewDialog as switchSubmitReviewDialogAction,
    setForceExitAnnotationFlag as setForceExitAnnotationFlagAction,
} from 'actions/annotation-actions';

interface StateToProps {
    annotationFormats: any;
    jobInstance: any;
    loadActivity: string | null;
    dumpActivities: string[] | null;
    exportActivities: string[] | null;
    user: any;
}

interface DispatchToProps {
    loadAnnotations(job: any, loader: any, file: File): void;
    dumpAnnotations(task: any, dumper: any): void;
    exportDataset(task: any, exporter: any): void;
    removeAnnotations(sessionInstance: any): void;
    switchRequestReviewDialog(visible: boolean): void;
    switchSubmitReviewDialog(visible: boolean): void;
    setForceExitAnnotationFlag(forceExit: boolean): void;
    saveAnnotations(jobInstance: any, afterSave?: () => void): void;
    updateJob(jobInstance: any): void;
}

function mapStateToProps(state: CombinedState): StateToProps {
    const {
        annotation: {
            activities: { loads: jobLoads },
            job: { instance: jobInstance },
        },
        formats: { annotationFormats },
        tasks: {
            activities: { dumps, loads, exports: activeExports },
        },
        auth: { user },
    } = state;

    const taskID = jobInstance.task.id;
    const jobID = jobInstance.id;

    return {
        dumpActivities: taskID in dumps ? dumps[taskID] : null,
        exportActivities: taskID in activeExports ? activeExports[taskID] : null,
        loadActivity: taskID in loads || jobID in jobLoads ? loads[taskID] || jobLoads[jobID] : null,
        jobInstance,
        annotationFormats,
        user,
    };
}

function mapDispatchToProps(dispatch: any): DispatchToProps {
    return {
        loadAnnotations(job: any, loader: any, file: File): void {
            dispatch(uploadJobAnnotationsAsync(job, loader, file));
        },
        dumpAnnotations(task: any, dumper: any): void {
            dispatch(dumpAnnotationsAsync(task, dumper));
        },
        exportDataset(task: any, exporter: any): void {
            dispatch(exportDatasetAsync(task, exporter));
        },
        removeAnnotations(sessionInstance: any): void {
            dispatch(removeAnnotationsAsync(sessionInstance));
        },
        switchRequestReviewDialog(visible: boolean): void {
            dispatch(switchRequestReviewDialogAction(visible));
        },
        switchSubmitReviewDialog(visible: boolean): void {
            dispatch(switchSubmitReviewDialogAction(visible));
        },
        setForceExitAnnotationFlag(forceExit: boolean): void {
            dispatch(setForceExitAnnotationFlagAction(forceExit));
        },
        saveAnnotations(jobInstance: any, afterSave?: () => void): void {
            dispatch(saveAnnotationsAsync(jobInstance, afterSave));
        },
        updateJob(jobInstance: any): void {
            dispatch(updateJobAsync(jobInstance));
        },
    };
}

type Props = StateToProps & DispatchToProps & RouteComponentProps;

function AnnotationMenuContainer(props: Props): JSX.Element {
    const {
        jobInstance,
        user,
        annotationFormats: { loaders, dumpers },
        history,
        loadActivity,
        dumpActivities,
        exportActivities,
        loadAnnotations,
        dumpAnnotations,
        exportDataset,
        removeAnnotations,
        switchRequestReviewDialog,
        switchSubmitReviewDialog,
        setForceExitAnnotationFlag,
        saveAnnotations,
        updateJob,
    } = props;

    const onClickMenu = (params: MenuInfo, file?: File): void => {
        if (params.keyPath.length > 1) {
            const [additionalKey, action] = params.keyPath;
            if (action === Actions.DUMP_TASK_ANNO) {
                const format = additionalKey;
                const [dumper] = dumpers.filter((_dumper: any): boolean => _dumper.name === format);
                if (dumper) {
                    dumpAnnotations(jobInstance.task, dumper);
                }
            } else if (action === Actions.LOAD_JOB_ANNO) {
                const format = additionalKey;
                const [loader] = loaders.filter((_loader: any): boolean => _loader.name === format);
                if (loader && file) {
                    loadAnnotations(jobInstance, loader, file);
                }
            } else if (action === Actions.EXPORT_TASK_DATASET) {
                const format = additionalKey;
                const [exporter] = dumpers.filter((_exporter: any): boolean => _exporter.name === format);
                if (exporter) {
                    exportDataset(jobInstance.task, exporter);
                }
            }
        } else {
            const [action] = params.keyPath;
            if (action === Actions.REMOVE_ANNO) {
                removeAnnotations(jobInstance);
            } else if (action === Actions.REQUEST_REVIEW) {
                switchRequestReviewDialog(true);
            } else if (action === Actions.SUBMIT_REVIEW) {
                switchSubmitReviewDialog(true);
            } else if (action === Actions.RENEW_JOB) {
                jobInstance.status = TaskStatus.ANNOTATION;
                updateJob(jobInstance);
                history.push(`/tasks/${jobInstance.task.id}`);
            } else if (action === Actions.FINISH_JOB) {
                jobInstance.status = TaskStatus.COMPLETED;
                updateJob(jobInstance);
                history.push(`/tasks/${jobInstance.task.id}`);
            } else if (action === Actions.OPEN_TASK) {
                history.push(`/tasks/${jobInstance.task.id}`);
            }
        }
    };

    const isReviewer = jobInstance.reviewer?.id === user.id || user.isSuperuser;

    return (
        <AnnotationMenuComponent
            taskMode={jobInstance.task.mode}
            loaders={loaders}
            dumpers={dumpers}
            loadActivity={loadActivity}
            dumpActivities={dumpActivities}
            exportActivities={exportActivities}
            onClickMenu={onClickMenu}
            setForceExitAnnotationFlag={setForceExitAnnotationFlag}
            saveAnnotations={saveAnnotations}
            jobInstance={jobInstance}
            isReviewer={isReviewer}
        />
    );
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AnnotationMenuContainer));
