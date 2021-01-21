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
    const markArr = []

    const parseToDOM = (node) => {
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
                // 多节点的时候就需要收集一次了
                markArr.push(splitHeader(start))
                markArr.push(splitTail(end))
                markArr.forEach(item => {
                    parseToDOM(item)
                })
                traversalDom(start, end)
            }

            // splitTail(end)
        }

    }

    // 处理头部节点
    const splitHeader = (header) => {

        header.node.splitText(header.offset)
        return header.node.nextSibling
    }

    // 处理尾部节点
    const splitTail = (tail) => {
        console.log(tail.offset)
        let newNode = tail.node.splitText(tail.offset)
        return newNode.previousSibling
    }

    // 首尾在一个文本节点的情况
    const splitNode = (node, header, tail) => {
        let newNode = node.splitText(header)
        console.log(newNode);
        let newNode2 = newNode.splitText(tail - header)
        // console.log(newNode2);
        // console.log(header, tail);
        // node.splitText(header)
        // console.log(node.splitText(header).splitText(tail - header ));
        // node.splitText(tail - header)
        return newNode
    }

    // dom树遍历
    const traversalDom = (start, end) => {

        // dom遍历并收集文本节点
        // 简单的处理肯定是使用dfs
        let startNode = start.node
        console.log(start.node.nextSibling)
        console.log(end.node)
        console.log(start.node.nextSibling == end.node);
        // 1.先假设层级为1
        // while (startNode.nextSibling != end.node) {
        //     // 在判断是不是文本节点
        //     console.log(1);
        //     if (startNode.nextSibling.nodeType === 3) {
        //         // dfs还是循环 ?
        //         markArr.push(startNode.nextSibling)
        //     }

        // }

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