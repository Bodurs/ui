import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';
import { NavLink, Link, useParams } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import provinces from './../../../../src/data/provinces.json';
import ApiService from './../../../services/ApiService';

import Breadcrumb from '../../../layouts/AdminLayout/Breadcrumb';

const SignUp1 = () => {

  const imageList = [
    "/assets/images/web/togg3.jpg",
    "/assets/images/web/togg1.jpg",
    "/assets/images/web/togg2.jpg"
  ];

  const { token } = useParams();
  if (!token || token.length != 19) {
    alert("invalid token");
  }

  const [selectedProvince, setSelectedProvince] = useState('');
  const [districts, setDistricts] = useState([]);
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [showLoginSelection, setShowLoginSelection] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [showOtp, setShowOtp] = useState(false);

  const settings = {
    dots: true,
    arrows: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    appendDots: dots => (
      <div style={{ marginTop: "20px" }}>
        <ul style={{ display: "flex", justifyContent: "center", gap: "10px" }}>{dots}</ul>
      </div>
    ),
    customPaging: i => (
      <div
        style={{
          width: "30px",
          height: "4px",
          background: "#ccc",
          borderRadius: "4px",
          opacity: 0.6
        }}
      />
    )
  };


  useEffect(() => {
    checkCustomer();
  }, []);

  async function checkCustomer() {
    setLoading(true);
    try {
      const response = await ApiService.post('/api/customer/check', {
        token_id: token
      });
      if (response.result.code == 0 && response.data.registered) {
        setRegistered(true);
      }
      setLoading(false);
    } catch (error) {
      console.error('GET request error:', error);
      setLoading(false);
      throw error;
    }
  }

  const handleRegister = async (values, { setSubmitting, setErrors }) => {

    try {
      const response = await ApiService.post('/api/customer/register', {
        name: values.name,
        identity_no: values.identity_no,
        email: values.email,
        phone: values.phone,
        province: values.province,
        district: values.district,
        address: values.address,
        plate: values.plate,
        billing_type: values.billing_type,
        comp_name: values.comp_name,
        tax_id: values.tax_id,
        tax_office: values.tax_office,
        token_id: token
      });

      console.log("response", response);
      if (response.result.code == 0) {
        setRegistered(true);
      }
    } catch (error) {
      // Hata durumunda Formik'e hata gönder
      console.log("error", error);
      setErrors({ submit: error.response?.data?.message || 'Register failed' });
    } finally {
      setSubmitting(false);
    }
  };

  async function changeScreen(screen) {
    if (screen == 'register') {
      setShowLoginSelection(false);
      setShowRegister(true);
      setShowOtp(false);
    } else if (screen == 'otp') {
      setShowLoginSelection(false);
      setShowRegister(false);
      setShowOtp(true);
    } else {
      setShowLoginSelection(true);
      setShowRegister(false);
      setShowOtp(false);
    }
  }

  return (
    <React.Fragment>
      <Breadcrumb />
      <div className="auth-wrapper">
        <div className="auth-content">
          <div className="auth-bg">
            <span className="r" />
            <span className="r s" />
            <span className="r s" />
            <span className="r" />
          </div>
          <Card className="borderless">
            <Row className="align-items-center">
              {showRegister &&
                <Col>
                  <Card.Body className="text-center">
                    {!registered ? <Formik
                      initialValues={{
                        name: '',
                        identity_no: '',
                        email: '',
                        phone: '',
                        province: '',
                        district: '',
                        address: '',
                        plate: '',
                        acceptTerms: true,
                        billing_type: 'individual',
                        comp_name: '',
                        tax_id: '',
                        tax_office: '',
                        submit: null,
                      }}
                      validationSchema={Yup.object().shape({
                        plate: Yup.string()
                          .min(4, 'Plate must be at least 4 characters')
                          .max(10, 'Plate must be at most 10 characters')
                          .required('Plate is required'),
                        name: Yup.string()
                          .min(5, 'Name must be at least 5 characters')
                          .max(50, 'Name must be at most 50 characters')
                          .required('Name is required'),
                        identity_no: Yup.string()
                          .matches(/^\d{11}$/, 'Identity number must be exactly 11 digits')
                          .required('Identity number is required'),
                        phone: Yup.string()
                          .matches(/^5\d{9}$/, 'Phone number must be exactly 10 digits and start with 5')
                          .required('Phone number is required'),
                        email: Yup.string()
                          .email('Invalid email address')
                          .required('Email is required'),
                        billing_type: Yup.string()
                          .oneOf(['individual', 'corporate'])
                          .required('Billing type is required'),
                        comp_name: Yup.string()
                          .min(5, 'Company name must be at least 5 characters')
                          .max(200, 'Company name must be at most 200 characters')
                          .when('billing_type', {
                            is: 'corporate',
                            then: schema => schema.required('Company name is required'),
                            otherwise: schema => schema.notRequired()
                          }),
                        tax_id: Yup.string()
                          .matches(/^\d+$/, 'Tax ID must be numeric only')
                          .min(8, 'Tax ID must be at least 8 digits')
                          .max(12, 'Tax ID must be at most 12 digits')
                          .when('billing_type', {
                            is: 'corporate',
                            then: schema => schema.required('Tax ID is required'),
                            otherwise: schema => schema.notRequired()
                          }),
                        tax_office: Yup.string()
                          .min(5, 'Tax Office must be at least 5 characters')
                          .max(500, 'Tax Office must be at most 500 characters')
                          .when('billing_type', {
                            is: 'corporate',
                            then: schema => schema.required('Tax Office is required'),
                            otherwise: schema => schema.notRequired()
                          }),
                        province: Yup.string()
                          .required('Province is required'),
                        district: Yup.string()
                          .required('District is required'),
                        address: Yup.string()
                          .min(5, 'Address must be at least 5 characters')
                          .max(200, 'Address must be at most 200 characters')
                          .required('Address is required'),
                        acceptTerms: Yup.bool()
                          .oneOf([true], 'You must accept the terms and privacy policy')
                          .required('You must accept the terms')
                      })}
                      onSubmit={handleRegister}
                    >
                      {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
                        <form noValidate onSubmit={handleSubmit}>
                          <div className="mb-4">
                            <img src="/assets/images/elvegtfsdark.png" width="40%" />
                          </div>
                          {/*<h3 className="mb-4">Register</h3>*/}

                          <div className="mb-4 text-center">
                            <div className="btn-group w-100" role="group">
                              <input
                                type="radio"
                                className="btn-check"
                                name="billing_type"
                                id="individual"
                                autoComplete="off"
                                value="individual"
                                checked={values.billing_type === 'individual'}
                                onChange={handleChange}
                              />
                              <label
                                className={`btn ${values.billing_type === 'individual'
                                  ? 'btn-dark text-white'
                                  : 'btn-light text-dark'
                                  }`}
                                htmlFor="individual"
                              >
                                Individual
                              </label>

                              <input
                                type="radio"
                                className="btn-check"
                                name="billing_type"
                                id="corporate"
                                autoComplete="off"
                                value="corporate"
                                checked={values.billing_type === 'corporate'}
                                onChange={handleChange}
                              />
                              <label
                                className={`btn ${values.billing_type === 'corporate'
                                  ? 'btn-dark text-white'
                                  : 'btn-light text-dark'
                                  }`}
                                htmlFor="corporate"
                              >
                                Corporate
                              </label>
                            </div>
                          </div>

                          <div className="form-group-title">
                            <label htmlFor="formBasicEmail" className="form-label register-form-label">Vehicle Informations</label>
                          </div>

                          <div className="form-group register-form-group">
                            <input
                              placeholder="Plate Number"
                              type="text"
                              id="plate"
                              className="form-control"
                              name="plate"
                              onBlur={handleBlur}
                              onChange={(e) => {
                                let raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');

                                // Parçaları ayır
                                let valid = '';
                                let i = 0;

                                // 1. İlk 2 karakter sayı
                                const digitsStart = raw.slice(i, i + 2);
                                if (!/^\d{0,2}$/.test(digitsStart)) return;
                                valid += digitsStart;
                                i += digitsStart.length;

                                // 2. Sonraki 1-3 karakter harf
                                const letters = raw.slice(i).match(/^[A-Z]{1,3}/);
                                if (letters) {
                                  valid += letters[0];
                                  i += letters[0].length;
                                }

                                // 3. Sonunda 1-4 karakter rakam
                                const digitsEnd = raw.slice(i).match(/^\d{1,4}/);
                                if (letters && digitsEnd) {
                                  valid += digitsEnd[0];
                                }

                                // Toplam uzunluk 9 karakteri aşamaz
                                if (valid.length > 9) return;

                                handleChange({
                                  target: {
                                    name: 'plate',
                                    value: valid
                                  }
                                });
                              }}
                              value={values.plate} />
                            {touched.plate && errors.plate && (
                              <div className="text-danger mt-1">{errors.plate}</div>
                            )}
                          </div>

                          <div className="form-group-title">
                            <label htmlFor="formBasicEmail" className="form-label register-form-label">Personal Informations</label>
                          </div>

                          <div className="form-group register-form-group">
                            <input
                              placeholder="Name Surname"
                              type="text"
                              id="name"
                              className="form-control"
                              name="name"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              value={values.name}
                            />
                            {touched.name && errors.name && (
                              <div className="text-danger mt-1">{errors.name}</div>
                            )}
                          </div>
                          <div className="form-group register-form-group">
                            <input
                              placeholder="Identity No"
                              type="text"
                              id="identity-no"
                              className="form-control"
                              name="identity_no"
                              onBlur={handleBlur}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '');
                                if (value.length <= 11) {
                                  handleChange({
                                    target: {
                                      name: 'identity_no',
                                      value
                                    }
                                  });
                                }
                              }}
                              value={values.identity_no}
                            />
                            {touched.identity_no && errors.identity_no && (
                              <div className="text-danger mt-1">{errors.identity_no}</div>
                            )}
                          </div>
                          <div className="form-group register-form-group">
                            <input
                              placeholder="E-Mail"
                              type="email"
                              id="email"
                              className="form-control"
                              name="email"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              value={values.email}
                            />
                            {touched.email && errors.email && (
                              <div className="text-danger mt-1">{errors.email}</div>
                            )}
                          </div>
                          <div className="form-group register-form-group">
                            <input
                              placeholder="Phone Number"
                              type="text"
                              id="phone"
                              className="form-control"
                              name="phone"
                              onBlur={handleBlur}
                              onChange={(e) => {
                                let val = e.target.value.replace(/\D/g, ''); // Sadece rakam

                                if (val && val[0] !== '5') return;

                                if (val.length > 10) return;

                                handleChange({
                                  target: {
                                    name: 'phone',
                                    value: val
                                  }
                                });
                              }}
                              value={values.phone}
                            />
                            {touched.phone && errors.phone && (
                              <div className="text-danger mt-1">{errors.phone}</div>
                            )}
                          </div>

                          {values.billing_type == 'corporate' && <div>
                            <div className="form-group-title">
                              <label htmlFor="formBasicEmail" className="form-label register-form-label">Company Informations</label>
                            </div>

                            <div className="form-group register-form-group">
                              <input
                                placeholder="Company Name"
                                type="text"
                                id="comp_name"
                                className="form-control"
                                name="comp_name"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.comp_name}
                              />
                              {touched.comp_name && errors.comp_name && (
                                <div className="text-danger mt-1">{errors.comp_name}</div>
                              )}
                            </div>
                            <div className="form-group register-form-group">
                              <input
                                placeholder="Tax ID"
                                type="text"
                                id="tax_id"
                                className="form-control"
                                name="tax_id"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.tax_id}
                              />
                              {touched.tax_id && errors.tax_id && (
                                <div className="text-danger mt-1">{errors.tax_id}</div>
                              )}
                            </div>
                            <div className="form-group register-form-group">
                              <input
                                placeholder="Tax Office"
                                type="text"
                                id="tax_office"
                                className="form-control"
                                name="tax_office"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.tax_office}
                              />
                              {touched.tax_office && errors.tax_office && (
                                <div className="text-danger mt-1">{errors.tax_office}</div>
                              )}
                            </div>
                          </div>}

                          <div className="form-group-title">
                            <label htmlFor="formBasicEmail" className="form-label register-form-label">Address Informations</label>
                          </div>

                          <div className="form-group register-form-group">
                            <select
                              className="form-control"
                              name="province"
                              onChange={(e) => {
                                const selectedValue = e.target.value;
                                setSelectedProvince(selectedValue);

                                const province = provinces.find(p => String(p.value) === selectedValue);
                                setDistricts(province ? province.districts : []);

                                handleChange(e);
                              }}
                              onBlur={handleBlur}
                              value={values.province}
                            >
                              <option value="" style={{ color: '#6c757d' }}>Choose Province</option>
                              {provinces.map(province => (
                                <option key={province.value} value={province.value}>
                                  {province.text}
                                </option>
                              ))}
                            </select>
                            {touched.province && errors.province && (
                              <div className="text-danger mt-1">{errors.province}</div>
                            )}
                          </div>
                          <div className="form-group register-form-group">
                            <select
                              className="form-control"
                              name="district"
                              onChange={handleChange}
                              onBlur={handleBlur}
                              value={values.district}
                              disabled={districts.length === 0}
                            >
                              <option value="" style={{ color: '#6c757d' }}>Choose District</option>
                              {districts.map(district => (
                                <option key={district.value} value={district.value}>
                                  {district.text}
                                </option>
                              ))}
                            </select>
                            {touched.district && errors.district && (
                              <div className="text-danger mt-1">{errors.district}</div>
                            )}
                          </div>
                          <div className="form-group register-form-group">
                            <textarea
                              rows="2"
                              className="form-control"
                              name="address"
                              placeholder="Address"
                              onChange={handleChange}
                              onBlur={handleBlur}
                              value={values.address}
                            />
                            {touched.address && errors.address && (
                              <div className="text-danger mt-1">{errors.address}</div>
                            )}
                          </div>

                          <div className="form-check text-start mb-4 mt-2">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id="customCheck1"
                              name="acceptTerms"
                              onChange={handleChange}
                              onBlur={handleBlur}
                              checked={values.acceptTerms}
                            />
                            <label className="form-check-label" htmlFor="customCheck1">
                              I approve the <Link to="#">terms of use</Link> and <Link to="#">privacy policy</Link>.
                            </label>
                            {touched.acceptTerms && errors.acceptTerms && (
                              <div className="text-danger mt-1">{errors.acceptTerms}</div>
                            )}
                          </div>

                          <Button className="btn-block mb-4" disabled={isSubmitting} size="large" type="submit" variant="primary">
                            Register
                          </Button>
                        </form>
                      )}
                    </Formik> : <div className="text-center py-5">
                      <img src="/assets/images/web/success.png" alt="Success" style={{ width: '100px' }} />
                      <h4 className="mt-3 text-success">Registration Successful!</h4>
                      <p>You can continue with the payment process.</p>
                    </div>
                    }
                  </Card.Body>
                </Col>}
              {showLoginSelection && <Col className="login-selection-col">
                <Card.Body className="text-center login-selection-type-card">
                  <div className="hero-container">
                    <Slider {...settings}>
                      {imageList.map((src, index) => (
                        <div key={index}>
                          <img
                            src={src}
                            alt={`slide-${index}`}
                            style={{ width: "100%", height: "400px", objectFit: "cover" }}
                          />
                        </div>
                      ))}
                    </Slider>


                    <div className="bottom-panel text-center">
                      <h4 className="fw-bold mb-3">Welcome to Elvepay</h4>
                      <p className="text-muted mb-4">Log in to Pay</p>
                      <div className="d-grid gap-2">
                        <button className="btn btn-purple btn-lg" onClick={() => changeScreen('otp')}>I have an account</button>
                        <button className="btn btn-outline-secondary btn-lg" onClick={() => changeScreen('register')}>Register</button>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Col>}
              {showOtp && <Col className="login-selection-col">
                <Card.Body className="text-center login-selection-card">
                  <div className="container d-flex flex-column justify-content-center align-items-center code-input-container">
                    <div className="text-center mb-4">
                      <h2 className="fw-bold">Verify</h2>
                      <p className="text-muted">Enter code we’ve sent to your phone <br /><strong>+90 555 555 55 55</strong></p>
                    </div>

                    <form>
                      <div className="d-flex justify-content-center mb-4">
                        <input type="text" maxlength="1" className="code-input" />
                        <input type="text" maxlength="1" className="code-input" />
                        <input type="text" maxlength="1" className="code-input" />
                        <input type="text" maxlength="1" className="code-input" />
                        <input type="text" maxlength="1" className="code-input" />
                      </div>
                      <div className="text-center">
                        <span className="text-muted">Didn’t get the code?</span>
                        <a href="#" className="text-primary text-decoration-none ms-1">Resend it.</a>
                      </div>
                    </form>
                  </div>
                </Card.Body>
              </Col>}
            </Row>
          </Card>
        </div>
      </div>
    </React.Fragment>
  );
};

export default SignUp1;
