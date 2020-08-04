import React, { useRef, useState, useEffect, useLayoutEffect } from 'react'
import { jsonGet, jsonPut } from '@farpat/api'
import Str from '../../src/Str'
import TextComponent from '../ui/Form/TextComponent'
import places from 'places.js'
import Alert from '../ui/Alert/Alert'
import Dump from '../ui/Dump'

const getName = function (index, key) {
  return `addresses[${index}][${key}]`
}

const getError = function (errors, index) {
  return errors.addresses ? errors.addresses[index] : undefined
}

const addAddress = function (addresses, newAddress) {
  return [...addresses, newAddress]
}

const deleteAddress = function (addresses, indexToDelete) {
  addresses[indexToDelete] = {
    id        : addresses[indexToDelete].id,
    is_deleted: true,
  }

  return addresses
}

const updateAddress = function (addresses, indexToUpdate, addressToUpdate) {
  addresses[indexToUpdate] = {
    ...addresses[indexToUpdate],
    ...addressToUpdate
  }

  return addresses
}

function UpdateMyAddresses () {
  const form = useRef(null)
  const [state, setState] = useState({
    information : {},
    errors      : {},
    alert       : null,
    isLoading   : true,
    isSubmitting: false
  })

  useEffect(() => {
    (async function () {
      const response = await jsonGet('/profile-api/addresses')
      setState({
        ...state,
        information: response,
        isLoading  : false
      })
    })()
  }, [])

  const onUpdateLine2 = (key, value) => {
    const [, formattedKey] = key.match(/^addresses\[([0-9]+)\]/)

    const addresses = state.information.addresses
    addresses[window.parseInt(formattedKey)]['line2'] = value

    setState({
      ...state,
      information: { ...state.information, addresses },
      errors     : { ...state.errors }
    })
  }

  const onAddAddress = () => {
    let deliveryAddressIndex = state.information.delivery_address_index ?? state.information.addresses.length

    const addresses = addAddress(state.information.addresses, {
      id          : null,
      text        : '',
      line1       : '',
      line2       : '',
      postal_code : '',
      city        : '',
      country     : '',
      country_code: '',
    })

    setState({
      ...state,
      information: {
        ...state.information,
        addresses,
        delivery_address_index: deliveryAddressIndex
      }
    })
  }

  const onDeleteAddress = (index) => {
    let deliveryAddressIndex = state.information.delivery_address_index
    if (index === state.information.delivery_address_index) {
      deliveryAddressIndex = state.information.addresses.findIndex((address, indexToFind) => indexToFind !== index && !address.is_deleted)

      if (deliveryAddressIndex === -1) {
        deliveryAddressIndex = null
      }
    }

    setState({
      ...state,
      information: {
        ...state.information,
        addresses             : deleteAddress(state.information.addresses, index),
        delivery_address_index: deliveryAddressIndex
      }
    })
  }

  const onSelectAddress = (index) => {
    setState({
      ...state,
      information: {
        ...state.information,
        delivery_address_index: index
      }
    })
  }

  const onSubmit = function (event) {
    event.preventDefault()

    if (state.isSubmitting) {
      return false
    }

    setState({ ...state, isSubmitting: true, alert: null })

    jsonPut('/profile-api/addresses', state.information)
      .then(response => {
        setState({
          ...state,
          errors      : {},
          alert       : { type: 'success', message: 'Information updated with success!' },
          information : response,
          isSubmitting: false
        })
      })
      .catch(errors => {
        setState({
          ...state,
          errors,
          alert       : { type: 'danger', message: 'Information not updated' },
          isSubmitting: false,
        })
      })
  }

  useEffect(() => {
    if (state.isLoading === false) {
      form.current.querySelectorAll('input.algolia').forEach((input, index) => {
        if (input.classList.contains('ap-input')) {
          return
        }

        const placesAutoComplete = places({
          appId    : state.information.algolia.id,
          apiKey   : state.information.algolia.key,
          container: input
        })
          .configure({ language: 'en', type: 'address' })

        placesAutoComplete.setVal(state.information.addresses[index].text)

        placesAutoComplete.on('change', event => {
          setState({
            ...state,
            information: {
              ...state.information,
              addresses: updateAddress(state.information.addresses, index, {
                text        : event.suggestion.value,
                line1       : event.suggestion.name,
                postal_code : event.suggestion.postcode,
                city        : event.suggestion.city,
                country     : event.suggestion.country,
                country_code: event.suggestion.countryCode.toUpperCase(),
              })
            }
          })
        })

        placesAutoComplete.on('clear', () => {
          setState({
            ...state,
            information: {
              ...state.information,
              addresses: updateAddress(state.information.addresses, index, {
                id          : null,
                text        : '',
                line1       : '',
                line2       : '',
                postal_code : '',
                city        : '',
                country     : '',
                country_code: '',
              })
            }
          })
        })
      })
    }
  }, [state.information.addresses])

  if (state.isLoading) {
    return <div className="text-center mt-5">
      <i className='fas fa-spinner spinner fa-7x'/>
    </div>
  }

  return <form ref={form} className='mb-5' onSubmit={onSubmit}>
    <Dump object={state}/>

    {
      state.alert &&
      <Alert type={state.alert.type} message={state.alert.message}
             onClose={() => setState({ ...state, alert: null })}/>
    }

    <div className="addresses">
      {
        state.information.addresses.map((address, index) => {
          if (!address.is_deleted) {
            return <Address address={address} index={index} key={index}
                            onUpdateLine2={onUpdateLine2} onDeleteAddress={onDeleteAddress}
                            onSelectAddress={onSelectAddress}
                            isSelected={state.information.delivery_address_index === index}
                            error={getError(state.errors, index)}></Address>
          }
        })
      }
      <button type="button" className="btn btn-link text-success address address-add" onClick={onAddAddress}>
        <i className="fa fa-plus-circle"/> Add address
      </button>
    </div>

    {
      state.isSubmitting ?
        <button className="btn btn-primary" disabled><i className="fa fa-spinner spinner"/> Loading&hellip;
        </button> :
        <button className="btn btn-primary">Save informations</button>
    }
  </form>
}

export default UpdateMyAddresses

function Address ({ address, index, error, isSelected, onUpdateLine2, onDeleteAddress, onSelectAddress }) {
  return <div className={`address ${isSelected ? 'selected' : ''}`}>

    <TextComponent id={'address_text_' + index} className='algolia'
                   name={getName(index, 'text')} error={error} value={address.text}/>

    <TextComponent id={'address_line2_' + index} name={getName(index, 'line2')} value={address.line2}
                   attr={{ placeholder: 'Address line 2' }}
                   onUpdate={onUpdateLine2}/>

    <div>
      <button type="button" className="btn btn-link text-danger" onClick={() => onDeleteAddress(index)}>Delete</button>
      {
        !isSelected &&
        <button type="button" className="btn btn-link text-primary" onClick={() => onSelectAddress(index)}>Define by
          default</button>
      }
    </div>
  </div>
}

