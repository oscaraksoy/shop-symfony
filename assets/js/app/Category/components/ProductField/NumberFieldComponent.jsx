import React from "react";
import PropTypes from "prop-types";

class NumberFieldComponent extends React.Component {
    constructor(props) {
        super(props);
        this.changeValue = this.changeValue.bind(this);
    }

    changeValue(event) {
        this.props.updateFilter(this.props.productField.key, event.value);
    }

    getValue(key) {
        return this.props.filters[key] || '';
    }

    getFilterKey(suffix) {
        return `${this.props.productField.key}-${suffix}`;
    }

    render() {
        return (
            <div className="form-group">
                <p className="mb-1">{this.props.productField.label}</p>
                <div className="row no-gutters">
                    <div className="col">
                        <input name={this.getFilterKey('min')} value={this.getValue(this.getFilterKey('min'))}
                               onChange={this.changeValue}
                               className="form-control"
                               placeholder="min" type="number"/>
                    </div>
                    <div className="col">
                        <input name={this.getFilterKey('max')} value={this.getValue(this.getFilterKey('max'))}
                               onChange={this.changeValue}
                               className="form-control"
                               placeholder="max" type="number"/>
                    </div>
                </div>
            </div>
        );
    }
}

NumberFieldComponent.propTypes = {
    productField: PropTypes.shape({
        key:   PropTypes.string.isRequired,
        label: PropTypes.string.isRequired
    }),

    updateFilter: PropTypes.func.isRequired
};

export default NumberFieldComponent;