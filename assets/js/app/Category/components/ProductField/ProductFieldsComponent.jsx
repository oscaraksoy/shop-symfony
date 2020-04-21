import React from "react";
import {hot} from "react-hot-loader/root";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import NumberFieldComponent from "./NumberFieldComponent";
import StringFieldComponent from "./StringFieldComponent";

class ProductFieldsComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="filter-component">
                {
                    this.props.productFields.map(productField => {
                        if (productField.type === 'number') {
                            return <NumberFieldComponent key={productField.key} productField={productField}/>
                        } else if (productField.type === 'string') {
                            return <StringFieldComponent key={productField.key} productField={productField}/>
                        }
                    })
                }
            </div>
        );
    }
}

ProductFieldsComponent.propTypes = {
    productFields: PropTypes.arrayOf(PropTypes.shape({
        key:   PropTypes.string.isRequired,
        type:  PropTypes.string.isRequired,
        label: PropTypes.string.isRequired
    }))
};


const mapStateToProps = (state) => {
    return {
        productFields: state.products.allProductFields
    }
};

const mapDispatchToProps = (dispatch) => {
    return {}
};

export default connect(mapStateToProps, mapDispatchToProps)(hot(ProductFieldsComponent));