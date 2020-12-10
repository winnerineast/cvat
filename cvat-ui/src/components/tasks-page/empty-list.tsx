// Copyright (C) 2020 Intel Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { Link } from 'react-router-dom';
import Text from 'antd/lib/typography/Text';
import { Row, Col } from 'antd/lib/grid';
import Icon from '@ant-design/icons';

import { EmptyTasksIcon } from 'icons';

export default function EmptyListComponent(): JSX.Element {
    return (
        <div className='cvat-empty-tasks-list'>
            <Row justify='center' align='middle'>
                <Col>
                    <Icon className='cvat-empty-tasks-icon' component={EmptyTasksIcon} />
                </Col>
            </Row>
            <Row justify='center' align='middle'>
                <Col>
                    <Text strong>No tasks created yet ...</Text>
                </Col>
            </Row>
            <Row justify='center' align='middle'>
                <Col>
                    <Text type='secondary'>To get started with your annotation project</Text>
                </Col>
            </Row>
            <Row justify='center' align='middle'>
                <Col>
                    <Link to='/tasks/create'>create a new task</Link>
                    <Text type='secondary'> or try to </Text>
                    <Link to='/projects/create'>create a new project</Link>
                </Col>
            </Row>
        </div>
    );
}
