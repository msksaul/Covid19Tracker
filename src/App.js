import React, { useState, useEffect } from 'react';
import { MenuItem, FormControl, Select, Card, CardContent } from '@material-ui/core';
import InfoBox from './components/InfoBox';
import Map from './components/Map';
import Table from './components/Table';
import LineGraph from './components/LineGraph';
import { sortData } from './utils';
import './App.css';
import 'leaflet/dist/leaflet.css'

function App() {

  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState('worldwide');
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796});
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);

  useEffect(() => {
    fetch('https://disease.sh/v3/covid-19/all')
    .then(response => response.json())
    .then(data => {
      setCountryInfo(data)
    })
  }, [])

  useEffect(() => {
    const getCountriesData = async() => {
      await fetch('https://disease.sh/v3/covid-19/countries')
      .then((response) => response.json())
      .then((data) => {
        const countries = data.map((country) => (
          {
            name: country.country,
            value: country.countryInfo.iso2
          }
        ))

        const sortedData = sortData(data)
        setTableData(sortedData)
        setMapCountries(data)
        setCountries(countries)
      })
    }
    getCountriesData()
  }, []);

  const onCountryChange = async(event) => {
    const countryCode = event.target.value
    setCountry(countryCode)

    const url = countryCode === 'worldwide'
      ? 'https://disease.sh/v3/covid-19/all'
      : `https://disease.sh/v3/covid-19/countries/${countryCode}`
    
    await fetch(url)
    .then(response => response.json())
    .then(data => {
      setCountryInfo(data)

      setMapCenter([data.countryInfo.lat, data.countryInfo.long])
      setMapZoom(4)
    })
  };

  return (
    <div className='app'>
      <div className='app__left'>
        <div className='app__header'>
          <h1>COVID 19 TRACKER</h1>
          <FormControl className='app__dropdown'>
            <Select variant='outlined' value={country} onChange={onCountryChange}>
              <MenuItem value='worldwide'>Worldwide</MenuItem>
              {countries.map(country => (
                <MenuItem value={country.value}>{country.name}</MenuItem>
              ))}
              {/* loop trough all the countries */}
              {/* <MenuItem value='worldwide'>Worldwide</MenuItem>
              <MenuItem value='worldwide'>Worldwide1</MenuItem>
              <MenuItem value='worldwide'>Worldwide2</MenuItem>
              <MenuItem value='worldwide'>Worldwide3</MenuItem> */}
            </Select>
          </FormControl>
        </div>

        <div className='app__stats'>
          <InfoBox title='Coronavirus Cases' total={countryInfo.cases} cases={countryInfo.todayCases}/>
          <InfoBox title='Recovered' total={countryInfo.recovered} cases={countryInfo.todayRecovered}/>
          <InfoBox title='Deaths' total={countryInfo.deaths} cases={countryInfo.todayDeaths}/>
        </div>

        <Map center={mapCenter} zoom={mapZoom} countries={mapCountries}/>
      </div>

      <Card>
        <CardContent>
          <h3>Live Cases by Country</h3>
          <Table countries={tableData}/>
          <h3>Worldwide New Cases</h3>
          <LineGraph/>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
