import './App.css';

import React, { useState, useEffect } from 'react';
import { Select, Button, Tabs, Table, message , Card} from 'antd';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


const { Option } = Select;
const { TabPane } = Tabs;



function App() {
    const [countries, setCountries] = useState([]);
    const [countryA, setCountryA] = useState('Sweden');
    const [countryB, setCountryB] = useState('Mexico');
    const [compareData, setCompareData] = useState({});
    const [categoryGroups, setCategoryGroups] = useState([]);
    const [frequencies, setFrequencies] = useState([]);
    const [selectedRow, setSelectedRow] = useState(null); // For selected row
    const [chartData, setChartData] = useState([]); // For chart data

    useEffect(() => {
        axios.get('http://localhost:3002/api/countries')
            .then(response => setCountries(response.data))
            .catch(err => message.error('Failed to fetch countries'));
    }, []);

      

  // Extract unique CategoryGroups and Frequencies from data
  const getUniqueData = (data) => {
    const uniqueGroups = Array.from(new Set(data.map((item) => item.CategoryGroup)));
    const uniqueFrequencies = Array.from(new Set(data.map((item) => item.Frequency)));
    return { uniqueGroups, uniqueFrequencies };
  };

  useEffect(() => {
    // Check if both countryA and countryB data exist and are non-empty
    if (compareData[countryA]?.length > 0 && compareData[countryB]?.length > 0) {
      const uniqueData = getUniqueData([
        ...compareData[countryA],
        ...compareData[countryB],
      ]);
      setCategoryGroups(uniqueData.uniqueGroups);
      setFrequencies(uniqueData.uniqueFrequencies);
    }
  }, [compareData, countryA, countryB]);


    const handleCompare = async () => {
      try {
          const response = await axios.get('http://localhost:3002/api/compare', {
              params: {
                  countries: [countryA, countryB], // Query parameters
                  indicator: "Money"
              }
          });
         
          setCompareData(response.data);
      } catch (error) {
          console.error(error);
          message.error('Comparison request failed');
      }
  };


  const handleRowSelection = (row, country) => {
    const selectedCountryA = compareData[countryA]?.find((item) => item.Category === row.Category) || {};
    const selectedCountryB = compareData[countryB]?.find((item) => item.Category === row.Category) || {};

    const data = [
      {
        Country: countryA,
        LatestValue: selectedCountryA.LatestValue || 0,
        PreviousValue: selectedCountryA.PreviousValue || 0,
        Type: 'Latest Value',
        Frequency: selectedCountryA.Frequency || 'N/A',
        Unit: selectedCountryA.Unit || 'Number',
      },
  
      {
        Country: countryB,
        LatestValue: selectedCountryB.LatestValue || 0,
        PreviousValue: selectedCountryB.PreviousValue || 0,
        Type: 'Latest Value',
        Frequency: selectedCountryB.Frequency || 'N/A',
        Unit: selectedCountryB.Unit || 'Number',
      },
   
    ];

   
    setSelectedRow(row);
    setChartData(data);
  };


  const renderChart = () => {
    if (!chartData.length || !selectedRow) return null;
  
    const unit = chartData[0]?.Unit;
    const frequency = chartData[0]?.Frequency;

    return (
      <Card title={`Comparison for ${selectedRow.Category} (${unit}, ${frequency})`}>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="2 2" />
            <XAxis dataKey="Country" />
            <YAxis />
            {/* <YAxis label={{ value: unit, angle: -90, position: 'insideLeft' }} /> */}
            <Tooltip />
            <Legend />
  
            {/* Apply different colors dynamically */}
            {/* Dynamically set the color based on Country */}
            <Bar dataKey="LatestValue" fill="#8884d8"  />
            <Bar dataKey="PreviousValue" fill="#82ca9d"  />
  
            
          </BarChart>
        </ResponsiveContainer>
      </Card>
    );
  };
  
  

   

  const renderTable = (data, country) => {
    const columnOrder = ["Title", "LatestValue", "PreviousValue", "Unit", "Frequency", "HistoricalDataSymbol"];
    // const columnsToCapitalize = ["Unit"];
    // const columnsToUppercase = ["HistoricalDataSymbol"];
    const hiddenColumns = ["Country", "Category","LatestValueDate", "Source", "SourceURL", "URL", "CategoryGroup", "Adjustment", "CreateDate", "FirstValueDate", "PreviousValueDate"]; // Define hidden columns here
  
  
    // Generate table columns
    const allColumns = Array.isArray(data) && data.length > 0
      ? columnOrder
          // Step 1: Filter by existing keys and hiddenColumns
          .filter((key) => Object.keys(data[0]).includes(key) && !hiddenColumns.includes(key))
          // Step 2: Map to Ant Design Table column format
          .map((key) => ({
            title: key.replace(/([A-Z])/g, " $1").trim(),
            dataIndex: key,
            key: key,
          }))
          // Step 3: Add remaining keys not in columnOrder
          .concat(
            Object.keys(data[0])
              .filter((key) => !columnOrder.includes(key) && !hiddenColumns.includes(key))
              .map((key) => ({
                title: key.replace(/([A-Z])/g, " $1").trim(),
                dataIndex: key,
                key: key,
              }))
          )
      : [];


      

      return (
        <Table
            dataSource={data}
            columns={allColumns}
            pagination={false}
            
        style={{ width: "65vw" }}
            onRow={(record) => ({
              onClick: () => handleRowSelection(record, country),
            })}
            scroll={{
              y: 55 * 5,
              x: false
            }}
        />
    );


    



    }


   
  




    return (
      <div class="container">
      <div class="row-1">
      <Card title="Compare Countries Data">
    <Select
    showSearch
    placeholder="Select Country A"
    value={countryA}
    defaultValue={"Sweden"}
    onChange={value => setCountryA(value)}
    style={{ width: 200 }}
    notFoundContent={!countries.length ? "No countries found" : null}
>
    {countries.map((c, i) => (
        <Option key={c.Country + i} value={c.Country}>
            {c.Country}
        </Option>
    ))}
</Select>


            <Select
    showSearch
    placeholder="Select Country B"
    value={countryB}
    defaultValue={"Mexico"}
    onChange={value => setCountryB(value)}
    style={{ width: 200 }}
    notFoundContent={!countries.length ? "No countries found" : null}
>
    {countries.map((c, i) => (
        <Option key={c.Country + i} value={c.Country}>
            {c.Country}
        </Option>
    ))}
</Select>

            <Button onClick={handleCompare} type="primary" style={{ marginLeft: 20 }}>
                Compare
            </Button>
</Card>
      </div>

      <div class="row-2">
          <div class="col-60">
          <Tabs>
     

     {/* CategoryGroups Tabs */}
     {categoryGroups.length > 0 &&
       categoryGroups.map((group) => (
         <TabPane tab={group} key={group}>
           <h3>{group} - {countryA}</h3>
           {renderTable(
             compareData[countryA].filter((item) => item.CategoryGroup === group, countryA)
           )}
           <h3>{group} - {countryB}</h3>
           {renderTable(
             compareData[countryB].filter((item) => item.CategoryGroup === group, countryB)
           )}


         </TabPane>
       ))}
   </Tabs>
          </div>
          <div class="col-40"> {renderChart()}</div>
      </div>

      
  </div>





          
           

   
     
    );
}

export default App;