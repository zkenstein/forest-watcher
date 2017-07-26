import moment from 'moment';

export function activeDataset(area) {
  if (area.datasets === undefined) return false;
  const enabledDataset = { ...area.datasets.find((d) => (d.active === true)) };
  if (typeof enabledDataset !== 'undefined') { return enabledDataset; }
  return false;
}

export function enabledDatasetName(area) {
  if (!area.datasets) return false;
  const enabledDataset = activeDataset(area);
  return enabledDataset !== false ? enabledDataset.name : false;
}

export function getSupportedDatasets(coverage) {
  const layers = coverage.layers || [];
  const alerts = [
    {
      slug: 'umd_as_it_happens',
      name: 'GLAD',
      active: false,
      startDate: 6,
      endDate: moment().format('YYYYMMDD') // TODO: think a way to standarize with viirs
    }
  ];

  const globalAlerts = [
    {
      slug: 'viirs',
      name: 'VIIRS',
      active: false,
      startDate: '1',
      endDate: '8'
    }
  ];
  let datasets = [];
  for (let i = 0, aLength = alerts.length; i < aLength; i++) {
    for (let j = 0, lLength = layers.length; j < lLength; j++) {
      if (alerts[i].slug === layers[j]) {
        datasets.push(alerts[i]);
      }
    }
  }

  datasets = datasets.concat(globalAlerts);
  datasets[0].active = true;
  return datasets;
}
