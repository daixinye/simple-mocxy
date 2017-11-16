function equal(result, expect) {
  if (result == expect) {
    console.log('✅ 通过：%s', `${expect}（${typeof expect}）`)
  } else {
    console.log(
      '❌ 未通过：%s',
      `期望输出：${expect}（${typeof expect}），实际输出：${result}（${typeof result}）`
    )
  }
}

module.exports = function(cases) {
  cases.forEach((c, i) => {
    console.log('\n测试用例：%s', i + 1)
    try {
      c.call({
        equal
      })
    } catch (err) {
      console.log('❌ 未通过：', err)
    }
  })
}
