// Copyright (C) 2020-2021 Intel Corporation
//
// SPDX-License-Identifier: MIT

import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Row, Col } from 'antd/lib/grid';
import { CloseOutlined } from '@ant-design/icons';
import Comment from 'antd/lib/comment';
import Text from 'antd/lib/typography/Text';
import Title from 'antd/lib/typography/Title';
import Button from 'antd/lib/button';
import Input from 'antd/lib/input';
import moment from 'moment';
import CVATTooltip from 'components/common/cvat-tooltip';

interface Props {
    id: number;
    comments: any[];
    left: number;
    top: number;
    resolved: boolean;
    isFetching: boolean;
    collapse: () => void;
    resolve: () => void;
    reopen: () => void;
    comment: (message: string) => void;
    highlight: () => void;
    blur: () => void;
}

export default function IssueDialog(props: Props): JSX.Element {
    const ref = useRef<HTMLDivElement>(null);
    const [currentText, setCurrentText] = useState<string>('');
    const {
        comments,
        id,
        left,
        top,
        resolved,
        isFetching,
        collapse,
        resolve,
        reopen,
        comment,
        highlight,
        blur,
    } = props;

    useEffect(() => {
        if (!resolved) {
            setTimeout(highlight);
        } else {
            setTimeout(blur);
        }
    }, [resolved]);

    const lines = comments.map(
        (_comment: any): JSX.Element => {
            const created = _comment.createdDate ? moment(_comment.createdDate) : moment(moment.now());
            const diff = created.fromNow();

            return (
                <Comment
                    avatar={null}
                    key={_comment.id}
                    author={<Text strong>{_comment.author ? _comment.author.username : 'Unknown'}</Text>}
                    content={<p>{_comment.message}</p>}
                    datetime={(
                        <CVATTooltip title={created.format('MMMM Do YYYY')}>
                            <span>{diff}</span>
                        </CVATTooltip>
                    )}
                />
            );
        },
    );

    const resolveButton = resolved ? (
        <Button loading={isFetching} type='primary' onClick={reopen}>
            Reopen
        </Button>
    ) : (
        <Button loading={isFetching} type='primary' onClick={resolve}>
            Resolve
        </Button>
    );

    return ReactDOM.createPortal(
        <div style={{ top, left }} ref={ref} className='cvat-issue-dialog'>
            <Row className='cvat-issue-dialog-header' justify='space-between'>
                <Col>
                    <Title level={4}>{id >= 0 ? `Issue #${id}` : 'Issue'}</Title>
                </Col>
                <Col>
                    <CVATTooltip title='Collapse the chat'>
                        <CloseOutlined onClick={collapse} />
                    </CVATTooltip>
                </Col>
            </Row>
            <Row className='cvat-issue-dialog-chat' justify='start'>
                <Col style={{ display: 'block' }}>{lines}</Col>
            </Row>
            <Row className='cvat-issue-dialog-input' justify='start'>
                <Col span={24}>
                    <Input
                        placeholder='Print a comment here..'
                        value={currentText}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            setCurrentText(event.target.value);
                        }}
                        onPressEnter={() => {
                            if (currentText) {
                                comment(currentText);
                                setCurrentText('');
                            }
                        }}
                    />
                </Col>
            </Row>
            <Row className='cvat-issue-dialog-footer' justify='end'>
                <Col>
                    {currentText.length ? (
                        <Button
                            loading={isFetching}
                            type='primary'
                            disabled={!currentText.length}
                            onClick={() => {
                                comment(currentText);
                                setCurrentText('');
                            }}
                        >
                            Comment
                        </Button>
                    ) : (
                        resolveButton
                    )}
                </Col>
            </Row>
        </div>,
        window.document.getElementById('cvat_canvas_attachment_board') as HTMLElement,
    );
}
