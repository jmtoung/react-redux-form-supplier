import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Form, Control, actions } from 'react-redux-form/immutable';
import { AutoComplete, TextField } from 'material-ui';
import { getCountries, getCities } from './creator';
import { isEqual } from 'lodash';

class SupplierForm extends Component {

  componentWillMount() {
    this.props.getCountries();
  };

  componentWillReceiveProps(nextProps) {
    // If the cities passed down to prop changes, we need to
    // validate the current selected city name (if any).
    if (this.props.cities.length > 0 && !isEqual(this.props.cities, nextProps.cities)) {
      if (this.props.selectedCityName) {
        this.validateCity(this.props.selectedCityName, nextProps.cities);
      }
    }
    // If the country code changes we need to re-query the server
    // for the appropriate cities.
    if (this.props.selectedCountryCode !== nextProps.selectedCountryCode) {
      this.props.getCities(nextProps.selectedCountryCode);
    }
  }

  onUpdateCountry = (searchText, dataSource, params) => {
    this.props.dispatch(actions.change('supplier.countryName', searchText));
    const matchingData = dataSource.find( d => d.text === searchText);
    if (matchingData) {
      this.props.dispatch(actions.change('supplier.countryCode', matchingData.value));
    }
    // Perform validation
    this.props.dispatch(actions.setErrors('supplier.countryName', {
      invalid: searchText && !matchingData && 'Invalid Country',
      required: !searchText && 'Required',
    }));
  }

  validateCity(value, cities) {
    console.log('validating city: ' + value);
    console.log(cities);
    const matchingData = cities.find( d => d.text === value);
    this.props.dispatch(actions.setErrors('supplier.cityName', {
      invalid: value && !matchingData && 'Invalid City',
      required: !value && 'Required',
    }));
  }

  onUpdateCity = (searchText, dataSource, params) => {
    this.props.dispatch(actions.change('supplier.cityName', searchText));
    const matchingData = dataSource.find( d => d.text === searchText);
    if (matchingData) {
      this.props.dispatch(actions.change('supplier.cityCode', matchingData.value));
    }
    this.validateCity(searchText, this.props.cities);
  }

  onNewCountryRequest = (chosenRequest, index) => {
    if (typeof chosenRequest === 'object') {
      this.props.dispatch(actions.change('supplier.countryName', chosenRequest.text));
      this.props.dispatch(actions.change('supplier.countryCode', chosenRequest.value));
      return;
    }
    this.onUpdateCountry(chosenRequest, this.props.countries)
  }

  onNewCityRequest = (chosenRequest, index) => {
    if (typeof chosenRequest === 'object') {
      this.props.dispatch(actions.change('supplier.cityName', chosenRequest.text));
      this.props.dispatch(actions.change('supplier.cityCode', chosenRequest.value));
      return;
    }
    this.onUpdateCity(chosenRequest, this.props.cities);
  }

  mapError = (props) => {
    if (!props.fieldValue.touched) {
      return '';
    }
    const errors = props.fieldValue.errors;
    const errorKeys = Object.keys(errors).filter(key => errors[key]);
    return errors[errorKeys[0]];
  }

  render() {
    return (
      <Form model="supplier">

        <div className="modal-container">
          <div className="modal-item">
            <Control
              model=".name"
              component={TextField}
              floatingLabelText="Name"
              floatingLabelFixed
              mapProps={{
                value: (props) => props.viewValue,
                errorText: this.mapError
              }}
            />
          </div>
          <div className="modal-item">
            <Control
              model=".countryName"
              component={AutoComplete}
              floatingLabelText="Country"
              floatingLabelFixed
              filter={AutoComplete.fuzzyFilter}
              onUpdateInput={this.onUpdateCountry}
              onNewRequest={this.onNewCountryRequest}
              dataSourceConfig={{text: 'text', value: 'value'}}
              dataSource={this.props.countries}
              mapProps={{ errorText: this.mapError }}
            />
          </div>
        <div className="modal-item">
          <Control
            model=".cityName"
            component={AutoComplete}
            floatingLabelText="City"
            floatingLabelFixed
            filter={AutoComplete.fuzzyFilter}
            onUpdateInput={this.onUpdateCity}
            onNewRequest={this.onNewCityRequest}
            dataSourceConfig={{text: 'text', value: 'value'}}
            dataSource={this.props.cities}
            mapProps={{ errorText: this.mapError }}
          />
        </div>
        </div>
      </Form>
    );
  }
}

const mapStateToProps = state => {
  const supplier = state.getIn(['myForms']).supplier;
  let countries = state.getIn(['Addresses', 'countries']);
  let cities = state.getIn(['Addresses', 'cities']);
  if (countries) {
    countries = countries.toJS();
  }
  if (cities) {
    cities = cities.toJS();
  }

  return {
    countries,
    cities,
    selectedCountryCode: supplier.get('countryCode'),
    selectedCityName: supplier.get('cityName'),
  };
};

const mapDispatchToProps = dispatch => {
  return {
    ...bindActionCreators({
      getCountries,
      getCities,
    }, dispatch),
    dispatch
  };
};

SupplierForm = connect(
  mapStateToProps,
  mapDispatchToProps,
)(SupplierForm);

export default SupplierForm;
