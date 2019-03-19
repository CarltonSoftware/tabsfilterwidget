import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import Select from 'react-select';
import moment from 'moment';
import DatePicker from 'react-datepicker';
require("react-datepicker/dist/react-datepicker.css");

class SearchFilterRow extends Component {

  handleChangeOperator = (event) => {
    let filter = this.props.filter;
    filter['value'] = this.getDefaultValue(event.currentTarget.value);
    filter['operator'] = event.currentTarget.value;
    this.props.updateFilter(filter);
  }

  updateFilter = (property, value) => {
    let filter = this.props.filter;
    filter[property] = value;

    this.props.updateFilter(filter);
  }

  handleChangeValueString = (event) => {
    this.updateFilter('value', event.currentTarget.value);
  }

  handleChangeValueNumber = (event) => {
    this.updateFilter('value', event.currentTarget.value);
  }

  handleChangeValueDate = (value) => {
    this.updateFilter('value', value);
  }

  handleChangeValueDatetime = (value) => {
    this.updateFilter('value', value);
  }

  handleChangeValueBoolean = (event) =>{
    this.updateFilter('value', event.currentTarget.checked);
  }

  handleChangeValueStringFrom = (selectedValue) => {
    let value = this.getDefaultValue(this.props.filter.operator);
    value.from = selectedValue;
    this.updateFilter('value', value);
  }

  handleChangeValueStringTo = (selectedValue) => {
    let value = this.getDefaultValue(this.props.filter.operator);
    value.to = selectedValue;
    this.updateFilter('value', value);
  }

  handleChangeValueNumberFrom = (value) => {
    this.handleChangeValueStringFrom(value);
  }

  handleChangeValueNumberTo = (value) => {
    this.handleChangeValueStringTo(value);
  }

  handleChangeValueDateFrom = (date) => {
    this.handleChangeValueStringFrom(date);
  }

  handleChangeValueDateTo = (date) => {
    this.handleChangeValueStringTo(date);
  }

  handleChangeValueDatetimeFrom = (datetime) => {
    this.handleChangeValueStringFrom(datetime);
  }

  handleChangeValueDatetimeTo = (datetime) => {
    this.handleChangeValueStringTo(datetime);
  }

  getOperatorOptions() {
    if (!this.props
      || !this.props.filter
      || !this.props.filter.operators
    ) {
      return [];
    }

    return this.props.filter.operators.map((operator, i) => {
      var label = 'Equals';
      switch (operator) {
      case '>':
        label = 'Greater than or equals';
        break;
      case '<':
        label = 'Less than or equals';
        break;
      case '|':
        label = 'In';
        break;
      case '~':
        label = 'Contains';
        break;
      case '^':
        return null;
      case '*':
        label = 'Starts with';
        break;
      case '/':
        label = 'Between';
        break;
      case '!=':
        label = 'Does not equal'
        break;
      default:
        label = 'Equals'
      }

      return (
        <option key={ i } value={ operator }>{ label }</option>
      );
    });
  }

getFilterInput = (type, value, onChange, props) => {
  if (!props) {
    props = {};
  }

  switch (type) {
  case 'datetime':
    return (
      <DatePicker 
        selected={ value }
        selectsStart
        showTimeSelect
        dateFormat="yyyy-MM-dd h.mm.aa"
        re
        onChange={ onChange }
        {...props}
      />
    );
  case 'date':
    return (
      <DatePicker 
        selected={ value }
        selectsStart
        showTimeSelect={ false }
        dateFormat="yyyy-MM-dd"
        re
        onChange={ onChange }
        {...props}
      />
    );
  case 'boolean':
    return (
      <input 
        type="checkbox"
        checked={ value }
        onChange={ onChange }
        {...props}
      />
    );
  case 'string':
  case 'number':
    if (this.props
      && this.props.selects
      && this.props.selects[this.props.filter.key]
    ) {
      return (
        <select defaultValue={ value } onChange={ onChange } {...props}>
          <option key={ 0 } value="">Select</option>
          { 
            this.props.selects[this.props.filter.key].map(function(o, i) {
              return (
                <option key={ i } value={ o.id }>{ o.name }</option>
              );
            })
          }
        </select>
      );
    }

    return (
      <input 
        type={ type === 'number' ? 'number' : 'text' }
        value={ value }
        onChange={ onChange }
        {...props}
      />
    );
  default:
    return null;
  }
}

getDefaultValue = (operator) => {
  let value = this.props.filter.value;
  let def = '';
  if (this.props.filter.type === 'date' || this.props.filter.type === 'datetime') {
    def = new Date();
  }

  if (operator != this.props.filter.operator) {
    value = def;
  }

  if (operator === '/') {
    if (!value || (operator != this.props.filter.operator)) {
      return {
        from: def,
        to: def
      };
    }

    if (typeof value !== 'object') {
      return {
        from: value,
        to: value
      };
    }
  }

  return value;
}
 
getFilterValue = () => {
  let currentOperator = this.props.filter.operator;
  let defaultValue = this.getDefaultValue(currentOperator);
  let type = this.props.filter.type;
  let handler = 'handleChangeValue' + type.charAt(0).toUpperCase() + type.slice(1);

  switch(this.props.filter.type){
    case 'boolean':
      return this.getFilterInput(
        this.props.filter.type,
        defaultValue,
        this[handler]
      );
    case 'string':
    case 'number':
    case 'date':
    case 'datetime':
      if (currentOperator === "/") {
        return (
          <React.Fragment> 
            { this.getFilterInput(this.props.filter.type, defaultValue.from, this[handler + 'From'], { maxDate: defaultValue.to }) } 
            <span>to</span>
            { this.getFilterInput(this.props.filter.type, defaultValue.to, this[handler + 'To'], { minDate: defaultValue.from }) }
          </React.Fragment>
        );
      } else if (currentOperator === '|') {
        return this.getFilterInput('string', defaultValue, this[handler]);
      } else {
        return this.getFilterInput(this.props.filter.type, defaultValue, this[handler]);
      }
    default:
      return null;
    }
  }

  render() {
    return (
      <tr>
        <td>{ this.props.filter.description }</td>
        <td>
          <select onChange={ this.handleChangeOperator }>
            { this.getOperatorOptions() }
          </select>
        </td>
        <td>
          { this.getFilterValue() }
        </td>
        <td>
          <button onClick={ this.props.removeFilter }>X</button>
        </td>
      </tr>
    );
  } 
}

class SearchFilter extends Component {
  constructor(props){
    super(props);

    let selectedFilters = [];
    if (props.defaultValue && Array.isArray(props.defaultValue)) {
      for (const i in props.defaultValue) {
        for (const j in props.filters) {
          if (props.defaultValue[i].key === j) {
            selectedFilters.push(
              this._mapSelectOption(
                props.filters[j],
                j,
                props.defaultValue[i].value,
                props.defaultValue[i].operator || '='
              )
            );
          }
        }
      }
    }

    this.state = {
      selectedFilters: selectedFilters
    };
  }

  /**
   * @return Object[]
   */
  getOptions() {
    let options = [];
    let existingKeys = this.state.selectedFilters.map((f) => f.key);
    _.each(this.props.filters, (element, key)=> {
      if (existingKeys.indexOf(key) < 0) {
        options.push({ 
          value: key,
          label: key + ' - ' + element.description
        });
      }
    });

    return options;
  }

  _mapSelectOption = (option, key, value, operator) => {
    option.key = key;
    option.operator = operator;
    option.value = value;

    return option;
  }

  /**
   * @return undefined
   */
  selectFilter = (selectedOption) => {
    if (selectedOption && this.props.filters[selectedOption.value]) {
      let selectedFilters = this.state.selectedFilters;
      let option = this.props.filters[selectedOption.value];
      let defaultValue = '';

      if (option.type === 'date' || option.type === 'datetime') {
        defaultValue = new Date();
      } else if (option.type === 'boolean') {
        defaultValue = false;
      }

      option = this._mapSelectOption(
        option,
        selectedOption.value,
        defaultValue,
        option.operators[0]
      );

      selectedFilters.push(option);
      this.setSelectedFilters(selectedFilters);
    }
  }

  updateFilter = (filter) => {
    let selectedFilters = this.state.selectedFilters;
    for (const i in selectedFilters) {
      if (selectedFilters[i].key === filter.key) {
        selectedFilters[i] = filter;
      }
    }

    this.setSelectedFilters(selectedFilters);
  }

  setSelectedFilters = (selectedFilters) => {
    this.setState({ 
      selectedFilters: selectedFilters
    }, () => {
      this.props.callback(
        this.getFilterObject(),
        this.getFilterString()
      )
    });
  }

  getFilterString = () => {
    var filters = this.getFilterObject();
    var filterString = [];
    for (const j in filters) {
      var val = filters[j].value;
      var op = filters[j].operator;
      if (op != '/') {
        if (filters[j].type === 'date') {
          val = moment(val).format('YYYY-MM-DD');
        } else if (filters[j].type === 'datetime') {
          val = moment(val).format('YYYY-MM-DD H.i.s');
        }
      } else {
        if (filters[j].type === 'date') {
          val = moment(val.from).format('YYYY-MM-DD') + '/' + moment(val.to).format('YYYY-MM-DD');
        } else if (filters[j].type === 'datetime') {
          val = moment(val.from).format('YYYY-MM-DD H.i.s') + '/' + moment(val.to).format('YYYY-MM-DD H.i.s');
        }
      }

      if (['|', '=', '/'].indexOf(op) >= 0) {
        filterString.push(filters[j].key + '=' + val);
      } else {
        filterString.push(filters[j].key + '=' + filters[j].operator + val);
      }
    }

    return filterString.join('&');
  }

  getFilterObject() {
    return this.state.selectedFilters.filter(function(f) {
      return f.value !== '';
    }).map(function(f) {
      return {
        key: f.key,
        operator: f.operator,
        value: f.value,
        type: f.type
      };
    });
  }

  removeFilter = (event) => {
    event.preventDefault();
    let key = event.currentTarget.value;
    var selectedFilters = this.state.selectedFilters;
    selectedFilters.splice(key,1);

    this.setSelectedFilters(selectedFilters);
  }

  render() {
    let selectedFilterControls = this.state.selectedFilters.map((filter, i) => {
      return (
        <SearchFilterRow key={ filter.key +  i } filter={ filter } selects={ this.props.selects } removeFilter={ this.removeFilter } updateFilter={ this.updateFilter } />
      );
    });

    return (
      <main className='tabsfilterwidget' id="tabsfilterwidget">
        { typeof this.props.onClose === 'function' && <button className='tabsfilterwidget__close' onClick={ this.props.onClose }>X</button> }
        { selectedFilterControls.length > 0 && <table className="tabsfilterwidget__table"><tbody>{ selectedFilterControls }</tbody></table> }

        <Select 
          isSearchable 
          isDisabled={ false } 
          isClearable
          placeholder='Select a filter or type to search..'
          onChange={ this.selectFilter }
          options={ this.getOptions() }
          value=''
        />
      </main>
    );
  }
}

SearchFilter.propTypes = {
  filters: PropTypes.object.isRequired,
  selects: PropTypes.object,
  defaultValue: PropTypes.array,
  onClose: PropTypes.func,
  callback: PropTypes.func
};

export default SearchFilter;
