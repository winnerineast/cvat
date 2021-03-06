// Copyright (C) 2020-2021 Intel Corporation
//
// SPDX-License-Identifier: MIT

import React, { RefObject } from 'react';
import { Row, Col } from 'antd/lib/grid';
import Input from 'antd/lib/input';
import Button from 'antd/lib/button';
import Form, { FormInstance, RuleObject } from 'antd/lib/form';
import { Store } from 'antd/lib/form/interface';

import CVATTooltip from 'components/common/cvat-tooltip';
import {
    Label, Attribute, validateParsedLabel, idGenerator,
} from './common';

function validateLabels(_: RuleObject, value: string): Promise<void> {
    try {
        const parsed = JSON.parse(value);
        if (!Array.isArray(parsed)) {
            return Promise.reject(new Error('Field is expected to be a JSON array'));
        }
        const labelNames = parsed.map((label: Label) => label.name);
        if (new Set(labelNames).size !== labelNames.length) {
            return Promise.reject(new Error('Label names must be unique for the task'));
        }

        for (const label of parsed) {
            try {
                validateParsedLabel(label);
            } catch (error) {
                return Promise.reject(error);
            }
        }
    } catch (error) {
        return Promise.reject(error);
    }

    return Promise.resolve();
}

interface Props {
    labels: Label[];
    onSubmit: (labels: Label[]) => void;
}

export default class RawViewer extends React.PureComponent<Props> {
    private formRef: RefObject<FormInstance>;

    public constructor(props: Props) {
        super(props);
        this.formRef = React.createRef<FormInstance>();
    }

    private handleSubmit = (values: Store): void => {
        const { onSubmit } = this.props;
        const parsed = JSON.parse(values.labels);
        for (const label of parsed) {
            label.id = label.id || idGenerator();
            for (const attr of label.attributes) {
                attr.id = attr.id || idGenerator();
            }
        }
        onSubmit(parsed);
    };

    public render(): JSX.Element {
        const { labels } = this.props;
        const convertedLabels = labels.map(
            (label: any): Label => ({
                ...label,
                id: label.id < 0 ? undefined : label.id,
                attributes: label.attributes.map(
                    (attribute: any): Attribute => ({
                        ...attribute,
                        id: attribute.id < 0 ? undefined : attribute.id,
                    }),
                ),
            }),
        );

        const textLabels = JSON.stringify(convertedLabels, null, 2);
        return (
            <Form layout='vertical' onFinish={this.handleSubmit} ref={this.formRef}>
                <Form.Item name='labels' initialValue={textLabels} rules={[{ validator: validateLabels }]}>
                    <Input.TextArea rows={5} className='cvat-raw-labels-viewer' />
                </Form.Item>
                <Row justify='start' align='middle'>
                    <Col>
                        <CVATTooltip title='Save labels and return'>
                            <Button style={{ width: '150px' }} type='primary' htmlType='submit'>
                                Done
                            </Button>
                        </CVATTooltip>
                    </Col>
                    <Col offset={1}>
                        <CVATTooltip title='Do not save the label and return'>
                            <Button
                                type='primary'
                                danger
                                style={{ width: '150px' }}
                                onClick={(): void => {
                                    if (this.formRef.current) {
                                        this.formRef.current.resetFields();
                                    }
                                }}
                            >
                                Reset
                            </Button>
                        </CVATTooltip>
                    </Col>
                </Row>
            </Form>
        );
    }
}
