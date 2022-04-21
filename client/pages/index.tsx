import Head from "next/head";
import styles from "../styles/Home.module.css";
import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import axios from "axios";

const getNameOne = async (name: string) => {
  try {
    let url = "http://localhost:3001/searchone?name=" + name;

    let { data } = await axios.get(url);
    console.log(data);
    return data;
  } catch (error) {
    console.error(error);
  }
};

const getNameTwo = async (name: string) => {
  try {
    let url = "http://localhost:3001/searchtwo?name=" + name;

    let { data } = await axios.get(url);
    return data;
  } catch (error) {
    console.error(error);
  }
};

export default function Home() {
  const [optionsOne, setOptionsOne] = useState([]);
  const [optionsTwo, setOptionsTwo] = useState([]);
  const [value, setValue] = useState("");

  const onChangeOne = async (e: any) => {
    if (e.target.value) {
      let data = await getNameOne(e.target.value);
      setOptionsOne(data);
    }
  };

  const onChangeTwo = async (e: any) => {
    if (e.target.value) {
      let data = await getNameTwo(e.target.value);
      setOptionsTwo(data);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div style={{ marginTop: 50 }}>
        <Autocomplete
          freeSolo
          filterOptions={(x) => x}
          onChange={(e: any) => {
            setValue(e.target.innerText);
          }}
          options={
            optionsOne
              ? optionsOne.map((obj: { name: string }) => obj.name)
              : []
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search One"
              onChange={(e) => onChangeOne(e)}
            />
          )}
        />
        <Autocomplete
          freeSolo
          filterOptions={(x) => x}
          onChange={(e: any) => setValue(e.target.innerText)}
          options={
            optionsTwo
              ? optionsTwo.map((obj: { name: string }) => obj.name)
              : []
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search Two"
              onChange={(e) => onChangeTwo(e)}
            />
          )}
        />
      </div>
      <h1>{value}</h1>
    </div>
  );
}
