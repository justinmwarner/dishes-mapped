import type { ClusterPoint, DishGroup } from './types'

export function computeClusters(groups: DishGroup[], zoom: number): ClusterPoint[] {
  const clusterRadiusPx = Math.max(18, 54 - zoom * 3)
  const clusters: Array<{
    centerPoint: { x: number; y: number }
    latTotal: number
    lngTotal: number
    labels: string[]
    groupIds: string[]
    count: number
  }> = []

  for (const group of groups) {
    const [lat, lng] = group.location
    const scale = 2 ** zoom
    const x = ((lng + 180) / 360) * 256 * scale
    const latRad = (lat * Math.PI) / 180
    const mercatorY =
      ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * 256 * scale

    let joinedCluster = false

    for (const cluster of clusters) {
      const dx = x - cluster.centerPoint.x
      const dy = mercatorY - cluster.centerPoint.y
      if (Math.sqrt(dx * dx + dy * dy) > clusterRadiusPx) {
        continue
      }

      cluster.count += 1
      cluster.latTotal += lat
      cluster.lngTotal += lng
      cluster.labels.push(...group.labels)
      cluster.groupIds.push(group.id)
      cluster.centerPoint.x = (cluster.centerPoint.x * (cluster.count - 1) + x) / cluster.count
      cluster.centerPoint.y =
        (cluster.centerPoint.y * (cluster.count - 1) + mercatorY) / cluster.count
      joinedCluster = true
      break
    }

    if (joinedCluster) {
      continue
    }

    clusters.push({
      centerPoint: { x, y: mercatorY },
      latTotal: lat,
      lngTotal: lng,
      labels: [...group.labels],
      groupIds: [group.id],
      count: 1,
    })
  }

  return clusters.map((cluster, index) => ({
    id: `cluster-${index}-${cluster.groupIds.join('|')}`,
    center: [cluster.latTotal / cluster.count, cluster.lngTotal / cluster.count],
    labels: cluster.labels,
    count: cluster.count,
  }))
}
