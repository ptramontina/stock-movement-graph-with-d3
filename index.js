import {
    select,
    csv,
    json,
    scaleLinear,
    scalePoint,
    max,
    scaleBand,
    axisLeft,
    axisBottom,
    timeFormat,
    linkHorizontal
} from 'd3'

const render = data => {
      const width = 1800
      const height = 1000

      const margin = { top: 30, right: 100, bottom: 300, left: 70 }
      const innerWidth = width - margin.left - margin.right
      const innerHeight = height - margin.top - margin.bottom

      let svg = select('#movement-chart')
        .append('svg')
        .attr('id', 'content-movement-chart')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .append("g")
        .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")")

      const amount = d => Math.abs(d.amount)
      const datetime = d => d.date
      const stock = d => d.stock
      const total = d => d.total

      const scaleDateTime = scalePoint()
        .domain(data.map(d => datetime(d)))
        .range([0, innerWidth])
        .padding(0.5)
        .align(-0.5)

      const scaleDateTimeBand = scaleBand()
        .domain(data.map(d => datetime(d)))
        .range([0, innerWidth])

      const scaleStock = scaleBand()
        .domain(data.map(d => stock(d)))
        .range([0, innerHeight])

      const columnSize = scaleDateTime.step()
      const columnSizeBand = scaleDateTimeBand.bandwidth()
      const lineSize = scaleStock.bandwidth()

      const scaleAmount = scaleLinear()
        .domain([0, max(data, d => amount(d))])
        .range([0, columnSize * .9])

      svg = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

      const xAxisTickformat = date => timeFormat('%d/%m/%Y %H:%M:%S')(date)
      const xAxis = axisBottom(scaleDateTimeBand)
        .tickFormat(date => date.format('L LTS'))
        .tickPadding(15)

      const xAxisG = svg.append('g')
        .attr('class', 'g-mov-x-axis')
        .call(xAxis)
        .attr('transform', `translate(0, ${innerHeight})`)
        .selectAll("text")
        .style("text-anchor", "start")
      	.attr('transform', `translate (20, 5) rotate (45)`)

      const yAxis = axisLeft(scaleStock)
        .tickSizeInner(-innerWidth)
      const yAxisG = svg.append('g')
        .attr('class', 'g-mov-y-axis')
        .call(yAxis)
        .attr('font-size', 15)
        .attr("class", "y axis")
        .selectAll(".y.axis .tick line")
        .attr("transform", "translate(0," + scaleStock.bandwidth() / 2 + ")")

      const groups = svg.selectAll('.amount')
        .data(data)
        .attr('class', 'amount')

      const groupAmount = groups.enter().append('g')
      groupAmount
        .merge(groups)
        .attr('transform', (d) => {
          let x = (scaleDateTime(datetime(d)) + ((columnSize) - (d.total !== d.amount && d.amount < 0 ? scaleAmount(total(d) + amount(d)) : scaleAmount(total(d)))) / 2)
          let y = (scaleStock(stock(d)) + (lineSize / 4))
          return `translate(${x}, ${y})`
        })

      const textGroup = groups.enter().append('g')
      textGroup
        .merge(groups)
        .attr('transform', (d) => {
          let x = (scaleDateTime(datetime(d)) + ((columnSize) - scaleAmount(amount(d))) / 2)
          let y = (scaleStock(stock(d)) + (lineSize / 4))
          return `translate(${x}, ${y})`
        })

      groupAmount.append('rect')
        .merge(groups.select('rect-total'))
        .attr('class', 'g-mov-rect-positive')
        .attr('width', d => d.total !== d.amount && d.amount < 0 ? scaleAmount(total(d) + amount(d)) : scaleAmount(total(d)))
        .attr('height', lineSize / 2)
        .attr('rx', '2')

      groupAmount.append('rect')
        .merge(groups.select('rect-amount'))
        .attr('class', 'g-mov-rect-negative')
        .attr('width', d => scaleAmount(amount(d)))
        .attr('height', lineSize / 2)
        .attr('visibility', d => d.amount < 0 ? 'visible' : 'hidden')
        .attr('rx', '2')

      textGroup.append('text')
        .merge(groups.select('text-amount'))
        .text(d => d.amount)
        .attr('x', d => scaleAmount(amount(d)) / 2)
        .attr('y', lineSize / 4 + 5)
        .attr('class', d => 'g-mov-text-amount ' + (d.amount > 0 ? 'positive' : 'negative'))

      textGroup.append('text')
        .merge(groups.select('text-total'))
        .text(d => `Left: ${d.total}`)
        .attr('x', d => scaleAmount(amount(d)) / 2)
        .attr('y', -20)
        .attr('class', 'g-mov-text-total')

      svg.append('text')
        .attr('class', 'g-mov-title')
        .attr('y', -20)
        .attr('x', innerWidth / 2)
        .attr('text-anchor', 'middle')
        .text('Stock Movement')
    }

json('data.json').then(data => {
    data.forEach(d => d.date = moment(d.date))
    render(data)
})