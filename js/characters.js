/**
 * 角色数据与管理
 */
const Characters = {
  list: [
    {
      id: 'rose',
      name: '玫瑰',
      image: 'assets/images/characters/rose-desk.webp',
      voiceKey: 'voiceRose',
      dialogue: '我是小王子星球上唯一的玫瑰。我承认，我有时候有些骄傲和任性，但我会用我的美丽和芬芳装点你的星球，请让我加入你的星球吧！',
      trait: '美丽而骄傲，内心温柔',
      chapter: '第8章'
    },
    {
      id: 'king',
      name: '国王',
      image: 'assets/images/characters/king.webp',
      voiceKey: 'voiceKing',
      dialogue: '我是一位国王，我统治着一切——当然，是在合理的范围内。我从不下达无法执行的命令，因为真正的权威建立在理性之上。如果你允许我加入，我保证只会命令太阳按时升起和落下。',
      trait: '追求权威但讲道理',
      chapter: '第10章'
    },
    {
      id: 'vain',
      name: '爱慕虚荣的人',
      image: 'assets/images/characters/vain.webp',
      voiceKey: 'voiceVain',
      dialogue: '啊，又来了一位崇拜者！请为我鼓掌吧！我是全宇宙最英俊、最优雅、最聪明的人！嗯……好吧，至少在我自己的星球上是这样。让我加入你的星球，我保证……嗯，我保证接受你们的赞美！',
      trait: '渴望被赞美和认可',
      chapter: '第11章'
    },
    {
      id: 'merchant',
      name: '商人',
      image: 'assets/images/characters/merchant.webp',
      voiceKey: 'voiceMerchant',
      dialogue: '我很忙，非常忙。我拥有五亿零一百六十二万二千七百三十一颗星星。我一直在数它们，记录它们。虽然有人说拥有星星没什么用，但我觉得管理和计算本身就是一种价值。请让我加入你的星球，我可以帮你管理一切资产。',
      trait: '忙碌而认真，很会算术',
      chapter: '第13章'
    }
  ],

  currentIndex: -1,

  getCurrentCharacter() {
    if (this.currentIndex >= 0 && this.currentIndex < this.list.length) {
      return this.list[this.currentIndex];
    }
    return null;
  },

  getNextCharacter() {
    this.currentIndex++;
    return this.getCurrentCharacter();
  },

  hasMore() {
    return this.currentIndex < this.list.length - 1;
  },

  reset() {
    this.currentIndex = -1;
  },

  getById(id) {
    return this.list.find(c => c.id === id);
  }
};
