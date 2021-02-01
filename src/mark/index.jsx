import React, { useEffect, useRef } from 'react';
import { getDomRange } from '../util.js/getDomRange.js'
import './index.css'

const Mark = (props) => {
    const { children } = props
    const markRef = useRef()


    useEffect(() => {
        let markRes = []
        if (localStorage.getItem('markDom')) {
            JSON.parse(localStorage.getItem('markDom')).forEach(
                node => {
                    console.log(node)
                    console.log(deSerialize(node))
                }
            )
        }
    })
    let allMarkArr = []
    let markArr = []
    let data = []
    let flag = 0
    let allTextNode = []
    useEffect(() => {
        allMarkArr = []
    }, [])

    /**
     * 
     * @param {*} node
     * 进行包裹 
     */
    const parseToDOM = (node) => {

        const parentNode = node.parentNode
        const span = document.createElement("span");
        const newNode = node.cloneNode(true);
        span.appendChild(newNode)
        span.className = 'mark'
        parentNode.replaceChild(span, node)


    }

    /**
     * 获取选取的dom信息
     */
    const electoral = () => {

        markArr = []
        flag = 0
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
                data.push(serialize(newNode))
                parseToDOM(newNode)


            } else {
                // 多节点的时候就需要收集一次了
                traversalDom(start, end)

                markArr[0] = splitHeader(start)
                markArr[markArr.length - 1] = splitTail(end)

                markArr.forEach(node => data.push(serialize(node)))
                markArr.forEach(node => {
                    parseToDOM(node)
                })

                // let saveMark = markArr.map(node => node)
                // allMarkArr.push(saveMark)
                // allMarkArr = allMarkArr.flat(2)
            }
            localStorage.setItem('markDom', JSON.stringify(data))
        }
    }

    /**
     * 
     * @param {*} textNode 
     * @param {*} root 
     * 开始进行DOM的序列化
     */
    const serialize = (textNode, root = document) => {

        // 这里要怎么写呢？
        // 记录每一个文本节点的具体位置，怎么记录呢？ 
        //childIndex 是在
        allTextNode = []
        const node = findFatherNode(textNode)
        getAllTextNode(node)

        // 拿该文本节点在他父亲种的所有文本节点的前后偏移量
        let childIndexStart = -1
        let childIndexend = -1
        let childIndex = -1


        // 计算前置偏移
        const calcLeftLength = (index) => {

            let length = 0
            for (let i = 0; i < index; i++) {
                length = length + allTextNode[i].length
            }
            return length
        }

        // 计算后置偏移
        const calcRightLength = (index) => {

            let length = 0
            for (let i = index + 1; i < allTextNode.length; i++) {
                length = length + allTextNode[index].length
            }
            return length
        }


        let Index = allTextNode.findIndex(textnode => textnode === textNode)
        if (Index === 0) {
            childIndexStart = 0     //前偏移
            childIndexend = calcLeftLength(Index + 1)   //后偏移
        } else if (Index === allTextNode.length - 1) {
            childIndexStart = calcLeftLength(Index)
            childIndexend = calcLeftLength(Index + 1)
        } else {
            childIndexStart = calcLeftLength(Index)
            childIndexend = calcLeftLength(Index + 1)
        }

        // 找出这个文本节点是其父节点的第几个孩子
        for (let i = 0; i < node.childNodes.length; i++) {
            if (node.childNode[i] === textNode) {
                childIndex = i
            }
        }
        // 通过它父亲的节点进行定位就可以😬
        const tagName = node.tagName
        const list = root.getElementsByTagName(tagName)
        for (let index = 0; index < list.length; index++) {
            if (node === list[index]) {
                return { tagName, index, childIndexStart, childIndexend, childIndex }
            }
        }
        return { tagName, index: -1, childIndexStart, childIndexend, childIndex }
    }

    /**
     * 
     * @param {*} proNode 
     * 获取全部文本节点，还是dfs
     */
    const getAllTextNode = (proNode) => {
        if (!proNode.childNodes) return
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
        const { tagName, index, childIndexStart, childIndexend, childIndex } = meta
        const parent = root.getElementsByTagName(tagName)[index]

        allTextNode = []
        getAllTextNode(parent)
        console.log(allTextNode)
        let nodeIndexStart = -1

        // 这里需要找一个区间
        // 有左右偏移量的情况，处理左右偏移量

        // let length3 = 0

        // 找目标文本节点对应的位置


        const calcLeftLength = (index) => {
            let length = 0
            for (let i = 0; i < index; i++) {
                length = length + allTextNode[i].length
            }
            return length
        }
        length3 = calcLeftLength(nodeIndexStart)

        // 下面又是不同的出口
        // 1 ij指的是同一个文本节点（那么就只有这一种情况）
        // 2 ij指的是不同的文本节点（这好像是不可能的）

        // 现在仅是拿到了文本节点，还得拿到选中得文本节点在该文本节点得文本偏移量
        console.log(nodeIndexStart)
        console.log(parent.childNodes[childIndex], childIndexStart - length3, childIndexend - length3);

        // 通过传进来的文本偏移量定位到该mark的数据，这里肯定不能是这么简单的写
        return splitNode(parent.childNodes[nodeIndexStart], childIndexStart - length3, childIndexend - length3)
    }

    /**
     * 
     * @param {*} header
     * 处理头部节点 
     */
    const splitHeader = (header) => {

        header.node.splitText(header.offset)
        return header.node.nextSibling
    }

    /**
     * 
     * @param {*} tail 
     * 处理尾部节点
     */
    const splitTail = (tail) => {
        return tail.node.splitText(tail.offset).previousSibling
    }

    /**
     * 
     * @param {*} node 
     * @param {*} header 
     * @param {*} tail 
     * 首尾在一个节点的情况
     */
    const splitNode = (node, header, tail) => {
        let newNode = node.splitText(header)
        newNode.splitText(tail - header)
        return newNode
    }

    /**
     * 
     * @param {*} node
     * 拿父节点 
     */
    const findFatherNode = (node) => {
        return node.parentNode
    }

    /**
     * 
     * @param {*} node 
     * @param {*} endNode 
     *  dfs收集
     */
    const collectTextNode = (node, endNode) => {
        // dfs
        if (node.nodeType === 3) {
            pushTextNode(node)
        } else {
            let childNodes = node.childNodes
            if (childNodes) {
                for (let i = 0; i < childNodes.length; i++) {
                    if (childNodes[i].nodeType === 3) {
                        pushTextNode(childNodes[i])
                        if (childNodes[i] == endNode) {
                            flag = 1
                            return
                        }
                    } else {
                        collectTextNode(childNodes[i], endNode)
                    }
                }
            } else {
                return
            }
        }
    }

    /**
     * 
     * @param {*} node
     * mark收集 
     */
    const pushTextNode = (node) => {
        markArr.push(node)
    }

    /**
     * 
     * @param {*} node 
     * @param {*} endNode 
     * 找亲叔叔😀
     */
    const findUncle = (node, endNode) => {
        if (node == markRef.current) {
            return
        }
        let currentNode = node
        // 到头了就找它父亲的下一个节点
        let current_fa = findFatherNode(currentNode)
        // 看它老子是不是当前节点的最后一个呢  (╯‵□′)╯炸弹！•••*～●
        if (current_fa.nextSibling) {
            collectTextNode(current_fa.nextSibling, endNode)
            if (flag == 1) {
                return
            } else {
                currentNode = current_fa.nextSibling
                while (currentNode.nextSibling != null && flag === 0) {
                    collectTextNode(currentNode.nextSibling, endNode)
                    currentNode = currentNode.nextSibling
                }
                if (flag == 0) {
                    collectTextNode(currentNode, endNode)
                    findUncle(currentNode, endNode)
                } else {
                    return
                }
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
    const traversalDom = (start, end) => {
        let currentNode = start.node
        if (currentNode.nextSibling) {
            while (currentNode != end.node && currentNode.nextSibling != null) {
                collectTextNode(currentNode, end.node)
                currentNode = currentNode.nextSibling
            }

            if (flag == 0) {
                collectTextNode(currentNode, end.node)
                findUncle(currentNode, end.node)
            } else {
                return
            }
        } else {
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