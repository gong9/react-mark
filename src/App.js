import Mark from './mark'


function App() {
  return (
    <div className="App">
      {/* <span>z这是测试啊<span>这是层级三 <span>这是层级4</span></span></span> */}
      <Mark>
       <h1>海报中心活动规则</h1>
       <p>海报分享奖励规则</p>
       <div>
         <p>活动有效期2021年7月20日-2021年8月20日</p>
         <p>小火花注册用户即可通过分享海报，获得奖励</p>
         <ul>
           <li>
           1、活动期间，每邀请1位好友注册并首次登陆小火花APP可获得100火花币，上不封顶
           </li>
           <li>
           2、如被邀请人通过活动海报注册，自被邀请人注册日起往后30天为锁粉期，被邀请人在app/公众号内首单购课（非他人邀请购课），您可获得佣金奖励。
注：
           </li>
         </ul>
       </div>
      </Mark>
    </div>
  );
}

export default App;
