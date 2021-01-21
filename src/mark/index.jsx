import React, { useEffect, useRef } from 'react';
import { getDomRange } from '../util.js/getDomRange.js'
import './index.css'
/**
 * 1， 找到选取
 * 2.  进行包裹
 * 3.  dom序列化与反序列化
 */

const Mark = (props) => {
    const { children } = props
    const markRef = useRef()
    useEffect(() => {
    })

    const parseToDOM = (node) => {
        // const span = document.createElement("span");
        // span.appendChild(node)
        // return span
        const parentNode = node.parentNode
        const span = document.createElement("span");
        const newNode = node.cloneNode(true);
        span.appendChild(newNode)
        span.className = 'mark'
        parentNode.replaceChild(span, node)
    }


    // 获取选取的dom信息
    const electoral = () => {
        let range = getDomRange()
        if (range) {

            // 获取起始位置和终止位置
            const start = {
                node: range.startContainer,
                offset: range.startOffset
            }
            const end = {
                node: range.endContainer,
                offset: range.endOffset
            }
            // 2. 处理头尾
            // 首尾是一个节点的情况,应该是取一个交集
            let newNode
            if (start.node === end.node) {

                newNode = splitNode(start.node, start.offset, end.offset)
                parseToDOM(newNode)
            } else {
                splitHeader(start)
                splitTail(end)

            }

            // splitTail(end)

        }

    }



    // 处理头部节点
    const splitHeader = (header) => {

        header.node.splitText(header.offset);
        return header.node.nextSibling
    }

    // 处理尾部节点
    const splitTail = (tail) => {
        console.log(tail.offset);
        return tail.node.splitText(tail.offset);
    }

    // 首尾在一个文本节点的情况
    const splitNode = (node, header, tail) => {
        console.log(header, tail);

        console.log(node.splitText(header).splitText(tail-header-1));
        // node.splitText(tail - header)
        return node
    }


    // dom树遍历
    const traversalDom = (header, tail) => {

        // dom遍历并收集文本节点
        // 简单的处理肯定是使用dfs

    }

    // 包裹选中的文本节点
    const parcel = (node) => {

    }



    return (
        <div ref={markRef} onMouseUp={electoral}>
            {children}
        </div>
    );
}

export default Mark;