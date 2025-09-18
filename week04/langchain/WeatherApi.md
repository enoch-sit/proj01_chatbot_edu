# Hong Kong Observatory Open Data Weather API Documentation

## Introduction

The Hong Kong Observatory (HKO) Open Data Weather API provides free access to real-time and forecasted weather information for Hong Kong. It is part of HKO's open government data initiative, allowing developers, researchers, and the public to integrate live weather data into applications, websites, or analyses. The API focuses on weather reports, forecasts, warnings, and related meteorological data. All data is publicly available without authentication, but usage is subject to terms outlined below.

This documentation is based on the official HKO Open Data API Documentation (Version 1.12, November 2024).

## Base URL

The primary endpoint for weather data is:

```
https://data.weather.gov.hk/weatherAPI/opendata/weather.php
```

- **Method**: GET
- **Response Format**: JSON (default)
- **Rate Limit**: Not explicitly stated; reasonable usage is encouraged to avoid overload.

## Parameters

All requests require the `dataType` parameter to specify the dataset. Optional parameters include:

- `dataType` (required, string): Specifies the type of weather data (see table below).
- `lang` (optional, string): Language of the response. Options: `en` (English, default), `tc` (Traditional Chinese), `sc` (Simplified Chinese).

Example request:  
`https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=rhrread&lang=en`

## Available Data Types

The API supports six main datasets under the Weather Information category. Each is updated at varying frequencies for real-time relevance.

| Data Type       | Description                                                                 | Update Frequency                  | Key Response Fields Example |
|-----------------|-----------------------------------------------------------------------------|-----------------------------------|-----------------------------|
| `fnd`          | 9-day weather forecast for Hong Kong, including daily summaries and UV index. | Every 6 hours                     | `forecast` (array of daily objects with weatherDesc, tempMax, tempMin, etc.) |
| `rhrread`      | Current weather report from the Hong Kong Observatory, including temperature, humidity, wind, visibility, and rainfall across stations. | Hourly or upon significant change | `temperature` (array of station readings), `humidity`, `wind`, `rainfall` (district-level), `warningMessage` |
| `flw`          | Local weather forecast, providing short-term (next few hours) updates for Hong Kong regions. | Every 30 minutes                  | `forecastDesc` (array of period-based forecasts with weather, temperature, humidity) |
| `warningInfo`  | Detailed weather warning information, including active signals (e.g., tropical cyclone, thunderstorm) with update times and descriptions. | As warnings are issued/updated    | `warningList` (array of warning objects with type, status, updateTime) |
| `warnsum`      | Weather warning summary, a concise overview of current warnings.            | As warnings change                | `warnings` (array of summary objects) |
| `swt`          | Special weather tips, including advisories on tropical cyclones, heat, or other phenomena. | As tips are updated               | `tips` (array of tip objects with title, description) |

For full field details, refer to the official examples in the HKO documentation.

## Response Format

- **Format**: JSON object.
- **Structure**: Typically includes a top-level `data` object with metadata (e.g., `from`, `to`, `updateTime`) and nested arrays/objects for specific data (e.g., `temperature.data` as an array of station readings).
- **Common Fields**:
  - `updateTime`: ISO 8601 timestamp of the last update.
  - `lang`: Language of the response.
  - Error Handling: If invalid parameters are provided, returns a JSON error like `{"success": false, "error": "Invalid dataType"}`.
- **Example Response (for `dataType=rhrread`)**:

  ```json
  {
    "data": {
      "reportTime": "2025-09-18T21:00:00+08:00",
      "temperature": {
        "data": [
          {"place": "King's Park", "value": 28, "unit": "C"}
        ],
        "unit": "celsius"
      },
      "humidity": {
        "data": [{"place": "Hong Kong Observatory", "value": 76, "unit": "percent"}]
      },
      "warningMessage": ["The Tropical Cyclone Signal No. 1 has been issued."]
    }
  }
  ```

  (Note: Actual responses vary by dataType; see official docs for complete schemas.)

## Examples

### 1. Current Weather Report

- **Request**: `https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=rhrread&lang=en`
- **Use Case**: Display live temperatures and warnings on a dashboard.
- **Sample Output**: Includes station-specific temperatures, district rainfall, and active warnings (as shown in the conversation history).

### 2. 9-Day Forecast

- **Request**: `https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=fnd&lang=tc`
- **Use Case**: Integrate into a calendar app for weekly planning.
- **Sample Output**: Array of forecast days with icons, descriptions, and UV indices.

### 3. Weather Warnings

- **Request**: `https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=warningInfo&lang=en`
- **Use Case**: Alert users via push notifications.
- **Sample Output**: List of warnings with severity levels and expiration times.

For more examples, including code snippets in various languages, consult the HKO PDF documentation.

## Usage Guidelines

- **Access**: Free for non-commercial and commercial use, but attribute data to "Hong Kong Observatory" where possible.
- **Caching**: Recommended to cache responses for at least 5-10 minutes to reduce server load, especially for frequently updated data like `rhrread`.
- **Integration**: Suitable for web/mobile apps, IoT devices, or data analytics. Supports HTTPS only.
- **Best Practices**:
  - Always handle JSON parsing errors gracefully.
  - Use `lang` parameter for multilingual support.
  - Combine with other HKO APIs (e.g., earthquake or rainfall) for comprehensive apps.

## Limitations and Terms of Use

- **Coverage**: Data is Hong Kong-specific; no global forecasts.
- **Accuracy**: Provided "as is" – HKO is not liable for decisions based on the data. Verify critical uses with official sources.
- **Availability**: Service may be unavailable during maintenance or high-load events (e.g., typhoons).
- **Terms**: Prohibited uses include redistribution without permission, spamming, or malicious scraping. Comply with Hong Kong data protection laws. For bulk historical data, use the separate Open Data (Climate) API.
- **Versioning**: API version is 1.x; check the documentation PDF for updates.

For the latest details or additional APIs (e.g., earthquake or tidal data), download the full PDF from [HKO's site](https://www.hko.gov.hk/en/weatherAPI/doc/files/HKO_Open_Data_API_Documentation.pdf).
