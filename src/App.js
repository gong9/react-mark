import './App.css';
import Mark from './mark'


function App() {
  return (
    <div className="App">
      <Mark>
        <div>
          <h4>文章示例</h4>
          <p>Range 对象包含了选区的开始与结束信息，其中包括节点（node）与文本偏移量（offset）。节点信息不用多说，这里解释一下 offset 是指什么：例如，标签<p>这是一段文本的示例</p>，用户选取的部分是“一段文本”这四个字，这时首尾的 node 均为 p 元素内的文本节点（Text Node），而 startOffset 和 endOffset 分别为 2 和 6。

</p>
          <p>　与开头一样，文章的结尾也是相当重要的。成功的结尾，能使读者更深入、更透彻地理解文章内容，进一步领会文章的中心思想；精彩的结尾，能唤起读者的思考与共鸣，增强文章的感染力，结尾当如撞钟，"清音有余"。选择结尾的方法，也必须从全局来考虑，要使记叙的事件完整清楚，使文章的结构首尾呼应，以求得更好地表达中心，达到写作的目的。下面介绍几种常用的结尾方法。</p>
          <p>聂华苓的《人，又少了一个》，写了一个女乞讨者三年前后的不同形象与神态，表现了人格的堕落这一深刻的主题。文中作者未加任何评论与分析，只是用白描的手法，记述了事件的经过。结尾写道："砰地一声，大门被踢上了。那女人回过头来，冷笑了一声，然后漠然望了我一眼。她已经不认得我了！"这一不加修饰的自然结尾，给读者留下了无限的思考余地，令人回味无穷。例文《记一次乒乓球赛》使用的也是这种结尾方法。</p>
        </div>
      </Mark>
    </div>
  );
}

export default App;
