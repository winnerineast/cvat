// Copyright (C) 2021 Intel Corporation
//
// SPDX-License-Identifier: MIT

module.exports = {
    parser: false,
    plugins: {
        'postcss-preset-env': {
            browsers: '> 2.5%', // https://github.com/browserslist/browserslist
        },
    },
};
