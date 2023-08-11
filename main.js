const TIME_LIMIT = 300000 // 5 минут

const currencies = {
  left: document.querySelector('#currency-left'),
  right: document.querySelector('#currency-right')
}

const amounts = {
  left: document.querySelector('#amount-left'),
  right: document.querySelector('#amount-right')
}

const arrow = document.querySelector('.exchanger__inputs-divider')
const isArrowReversed = () => arrow.classList.contains('reversed')

const submitButton = document.querySelector('.exchanger__submit')

const historyList = document.querySelector('.history__list')

const cache = {}

function createHistoryItem(history) {
  const item = document.createElement('div')
  const from = document.createElement('span')
  const to = document.createElement('span')

  item.className = 'history__list-item'
  from.className = 'item-from'
  to.className = 'item-to'

  from.innerHTML = `${history.from.amount} ${history.from.currency}`
  to.innerHTML = `${history.to.amount} ${history.to.currency}`

  item.append(from, to)

  return item
}

async function exchange(from, to, amount) {
  if (!from) {
    alert('Не выбрана валюта `ИЗ`')
    return
  }

  if (!to) {
    alert('Не выбрана валюта `В`')
    return
  }

  if (from === to) {
    alert('Выбраны одинаковые валюты обмена')
    return
  }

  if (isNaN(amount)) {
    alert('Введенная сумма не является числом')
    return
  }

  const cachedData = cache[from]?.[to]
  if (cachedData && Date.now() - cachedData.time < TIME_LIMIT) {
    return {
      from,
      to,
      amount,
      result: (amount * cachedData.rate).toFixed(2)
    }
  }

  try {
    const response = await fetch(`https://v6.exchangerate-api.com/v6/02b8d15cfd89df3c3ee28267/pair/${from}/${to}/${amount}`)
    const json = await response.json()

    if (json.conversion_result === undefined) throw new Error()

    cache[from] = {
      [to]: {
        time: Date.now(),
        rate: json.conversion_rate
      }
    }

    return {
      from,
      to,
      amount,
      result: (+json.conversion_result).toFixed(2)
    }
  } catch {
    alert('Во время получения данных произошла ошибка. Повторите попытку')
    return
  }
}

arrow.addEventListener('click', () => (arrow.classList.toggle('reversed')))

submitButton.addEventListener('click', async () => {
  const inputSide = isArrowReversed() ? 'right' : 'left'
  const resultSide = isArrowReversed() ? 'left' : 'right'

  amounts[resultSide].value = ''

  const exchangeResult = await exchange(currencies[inputSide].value, currencies[resultSide].value, amounts[inputSide].value)
  if (!exchangeResult) return

  amounts[resultSide].value = exchangeResult.result

  historyList.appendChild(createHistoryItem({
    from: {
      currency: exchangeResult.from,
      amount: exchangeResult.amount
    },
    to: {
      currency: exchangeResult.to,
      amount: exchangeResult.result
    }
  }))
})