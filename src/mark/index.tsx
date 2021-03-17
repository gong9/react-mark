import * as React from 'react';
import { useEffect, useRef } from 'react'
import { getDomRange } from '../util.js/getDomRange.js'
import './index.css'

interface MarkProps {
    children: HTMLElement
}

const Mark = (props: MarkProps) => {
    const { children } = props
    const markRef = useRef()
    let markArr02 = []
    let markArr = []    //文本节点收集容器
    let data = []
    let flag = 0    //是否找到标志为 （0：未找到）
    let allTextNode = []



    //进行反序列化处理
    useEffect(() => {
        if (localStorage.getItem('markDom')) {
            JSON.parse(localStorage.getItem('markDom')).forEach(
                node => {
                    markArr02.push(deSerialize(node))
                }
            )
            markArr02 = markArr02.filter(node => { if (node) return node })
            markArr02.forEach(markNode => parseToDOM(markNode))

        }
    })

    /**
     * 
     * @param {*} node
     * 进行包裹 
     */
    const parseToDOM = (node: HTMLElement) => {
        const parentNode = node.parentNode
        if (parentNode) {
            const span = document.createElement("span");
            const newNode = node.cloneNode(true);
            span.appendChild(newNode)
            span.className = 'mark'
            parentNode.replaceChild(span, node)
        }
    }

    /**；
     * 获取选取的dom信息
     */
    interface InfoNode {
        node: Node,
        offset: number
    }
    const electoral = () => {
        markArr = []
        flag = 0
        let range = getDomRange()
        if (range) {
            // 获取起始位置和终止位置
            const start: InfoNode = {
                node: range.startContainer,
                offset: range.startOffset
            }
            const end: InfoNode = {
                node: range.endContainer,
                offset: range.endOffset
            }
            let newNode: Node
            // 处理头尾-----首尾是一个节点的情况,应该是取一个交集
            if (start.node === end.node) {
                newNode = splitNode(start.node, start.offset, end.offset)
                data.push(serialize(newNode))
                parseToDOM(newNode as HTMLElement)
            } else {
                // 多节点的情况
                traversalDom(start, end)
                markArr[0] = splitHeader(start)
                markArr[markArr.length - 1] = splitTail(end)

                // 去重处理
                let RDArr = [...new Set(markArr)]
                RDArr.forEach(node => data.push(serialize(node)))
                RDArr.forEach(node => {
                    parseToDOM(node)
                })
            }
            localStorage.setItem('markDom', JSON.stringify(data))
        }
    }

    /**
     * 
     * @param {*} textNode 
     * @param {*} root 
     * 开始进行DOM的序列化
     * 接受文本节点，拿到文本的相对于document的位置信息
     * 
     */
    const serialize = (textNode: Node, root = document) => {
        allTextNode = []
        const node = findFatherNode(textNode)
        getAllTextNode(node)
        let childIndexStart = -1
        let childIndexend = -1

        // 计算前置偏移
        const calcLeftLength = (index) => {
            let length = 0
            for (let i = 0; i < index; i++) {
                length = length + allTextNode[i].length
            }
            return length
        }
        let Index = allTextNode.findIndex(textnode => textnode === textNode)
        if (Index === 0) {
            childIndexStart = 0     //前偏移
            childIndexend = childIndexStart + (textNode as Text).length //后偏移
        } else if (Index === allTextNode.length - 1) {
            childIndexStart = calcLeftLength(Index)
            childIndexend = childIndexStart + (textNode as Text).length
        } else {
            childIndexStart = calcLeftLength(Index)
            childIndexend = childIndexStart + (textNode as Text).length
        }

        // 通过它父亲的节点进行定位就可以😬
        const tagName = (node as HTMLElement).tagName
        const list = root.getElementsByTagName(tagName)
        // 去掉mark所占的位置
        const newList = [...list].filter(node => node.className !== "mark")
        for (let index = 0; index < newList.length; index++) {
            if (node === newList[index]) {
                return { tagName, index, childIndexStart, childIndexend }
            }
        }
        return { tagName, index: -1, childIndexStart, childIndexend }
    }

    /**
     * 
     * @param {*} proNode 
     * 获取全部文本节点，还是dfs
     */
    const getAllTextNode = (proNode) => {
        if (proNode.childNodes.length === 0) return
        console.log(proNode);
        for (let i = 0; i < proNode.childNodes.length; i++) {
            if (proNode.childNodes[i].nodeType === 3) {
                allTextNode.push(proNode.childNodes[i])
            } else {
                getAllTextNode(proNode.childNodes[i])
            }
        }
    }

    /**
     * 
     * @param {*} meta 
     * @param {*} root 
     * 反序列化
     */
    const deSerialize = (meta, root = document) => {
        const { tagName, index, childIndexStart, childIndexend } = meta
        const parent = root.getElementsByTagName(tagName)[index]
        allTextNode = []
        if (parent) {
            getAllTextNode(parent)
            let nodeIndexStart = -1
            let length = 0
            let length3 = 0
            for (let i = 0; i < allTextNode.length; i++) {
                length = length + allTextNode[i].length
                if (length >= childIndexStart) {
                    nodeIndexStart = i
                    break;
                }
            }
            const calcLeftLength = (index) => {
                let length = 0
                for (let i = 0; i < index; i++) {
                    length = length + allTextNode[i].length
                }
                return length
            }
            length3 = calcLeftLength(nodeIndexStart)
            return splitNode(parent.childNodes[nodeIndexStart], childIndexStart - length3, childIndexend - length3)
        }
    }

    /**
     * 
     * @param {*} header
     * 处理头部节点 
     */
    const splitHeader = (header: InfoNode) => {
        (header.node as Text).splitText(header.offset)
        return header.node.nextSibling
    }

    /**
     * 
     * @param {*} tail 
     * 处理尾部节点
     */
    const splitTail = (tail: InfoNode) => {
        return (tail.node as Text).splitText(tail.offset).previousSibling
    }

    /**
     * 
     * @param {*} node 
     * @param {*} header 
     * @param {*} tail 
     * 首尾在一个节点的情况
     */
    const splitNode = (node: Node, header: number, tail: number) => {
        let newNode = (node as Text).splitText(header)
        newNode.splitText(tail - header)
        return newNode
    }

    /**
     * 
     * @param {*} node
     * 获取父节点 
     */
    const findFatherNode = (node: Node) => {
        return node.parentNode
    }

    /**
     * 
     * @param {*} node 
     * @param {*} endNode 
     *  去拿每一个节点所属的孩子节点中的文本节点
     */
    const collectTextNode = (node: Node, endNode: Node) => {
        if (node.nodeType === 3) {
            pushTextNode(node)
        }
        else {
            let childNodes = node.childNodes
            if (childNodes) {
                for (let i = 0; i < childNodes.length; i++) {
                    if (childNodes[i].nodeType === 3) {
                        pushTextNode(childNodes[i])
                        if (childNodes[i] == endNode) {
                            flag = 1
                            return
                        }
                    }
                    else {
                        collectTextNode(childNodes[i], endNode)
                    }
                }
            }
            else {
                return
            }
        }
    }

    /**
     * 
     * @param {*} node
     * mark收集，push到到markArr数组中
     */
    const pushTextNode = (node: Node) => {
        if (markArr.findIndex(item => node === item) === -1) {
            markArr.push(node)
        }
    }

    /**
     * 
     * @param {*} node 
     * @param {*} endNode 
     * 找亲叔叔😀
     */
    const findUncle = (node: Node, endNode: Node) => {
        // 顶点边界判断
        if (node == markRef.current) {
            return
        }
        let currentNode = node
        let current_fa = findFatherNode(currentNode)

        // 获取它叔叔的所有孩子节点中的文本节点，操作对象--->叔叔节点
        if (current_fa.nextSibling) {
            currentNode = current_fa.nextSibling
            while (currentNode.nextSibling != null && flag === 0) {
                collectTextNode(currentNode, endNode)
                currentNode = currentNode.nextSibling
            }
            if (flag == 0) {
                collectTextNode(currentNode, endNode)
                findUncle(currentNode, endNode)
            } else {
                return
            }
        } else {
            collectTextNode(currentNode, endNode)
            findUncle(current_fa, endNode)
        }
    }

    /**
     * 
     * @param {*} start 
     * @param {*} end 
     * dom树遍历
     */
    const traversalDom = (start: InfoNode, end: InfoNode) => {
        let currentNode = start.node
        if (currentNode.nextSibling) {
            while (currentNode != end.node && currentNode.nextSibling != null) {
                collectTextNode(currentNode, end.node)
                currentNode = currentNode.nextSibling
            }
            // 出来有两种可能 1. 找到了 2. 这一层到头了
            if (flag == 0) {
                collectTextNode(currentNode, end.node)
                findUncle(currentNode, end.node)
            } else {
                return
            }
        }
        // 当前层没有兄弟，直接去上一层找
        else {
            collectTextNode(currentNode, end.node)
            findUncle(currentNode, end.node)
        }
    }

    return (
        <div ref={markRef} onMouseUp={electoral}>
            {children}
        </div>
    );
}

export default Mark;