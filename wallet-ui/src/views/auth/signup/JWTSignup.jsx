import React from 'react';
import { useNavigate } from 'react-router-dom'; // For navigation
import { Row, Col, Alert, Button } from 'react-bootstrap';
import * as Yup from 'yup';
import { Formik } from 'formik';
import Cookies from 'js-cookie'; // For cookies
import ApiService from './../../../services/ApiService';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/bootstrap.css';

const JWTSignup = () => {

  const navigate = useNavigate();

  const handleSignup = async (values, { setSubmitting, setErrors }) => {
    try {
      // API'ye login isteği at
      const response = await ApiService.post('/auth/signup', {
        name: values.name,
        surname: values.surname,
        email: values.email,
        phone_number: values.phone_number,
        password: values.password,
        confirm_password: values.confirm_password,
      });

      // Token veya kullanıcı bilgisi döndüyse işlem yap
      if (response.data.data.access_token) {
        Cookies.set('access_token', response.data.data.access_token, { expires: 7 });
        navigate('/dashboard');
        //window.location.href = '/dashboard';
      }
    } catch (error) {
      // Hata durumunda Formik'e hata gönder
      setErrors({ submit: error.response?.data?.message || 'Login failed' });
    } finally {
      setSubmitting(false); // İşlemi tamamla
    }
  };

  const googleLogin = async (credentialResponse) => {
    console.log('Login Successful:', credentialResponse);
    const response = await ApiService.post('/auth/google', {
      credential: credentialResponse.credential
    });

    if (response.data.data.access_token) {
      Cookies.set('access_token', response.data.data.access_token, { expires: 7 });
      navigate('/dashboard');
      //window.location.href = '/dashboard';
    }
  };

  return (
    <Formik
      initialValues={{
        name: '',
        surname: '',
        email: '',
        phone_number: '',
        password: '',
        confirm_password: '',
        submit: null,
      }}
      validationSchema={Yup.object().shape({
        name: Yup.string().min(3).max(255).required('Name is required'),
        surname: Yup.string().min(2).max(255).required('Surname is required'),
        email: Yup.string().email('Invalid email address').required('Email is required'),
        phone_number: Yup.string()
          .min(10, 'Phone number must be at least 10 digits')
          .required('Phone number is required'),
        password: Yup.string().max(255).required('Password is required'),
        confirm_password: Yup.string()
          .max(255, 'Confirm password cannot exceed 255 characters')
          .required('Confirm password is required')
          .oneOf([Yup.ref('password'), null], 'Passwords must match'),
      })}
      onSubmit={handleSignup} // handleLogin burada Formik'in onSubmit fonksiyonuna atanıyor
    >
      {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
        <form noValidate onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <input
              className="form-control"
              name="name"
              onBlur={handleBlur}
              onChange={handleChange}
              type="text"
              value={values.name}
              placeholder="Name"
            />
            {touched.name && errors.name && <small className="text-danger form-text">{errors.name}</small>}
          </div>
          <div className="form-group mb-3">
            <input
              className="form-control"
              name="surname"
              onBlur={handleBlur}
              onChange={handleChange}
              type="text"
              value={values.surname}
              placeholder="Surname"
            />
            {touched.surname && errors.surname && <small className="text-danger form-text">{errors.surname}</small>}
          </div>
          <div className="form-group mb-3">
            <input
              className="form-control"
              name="email"
              onBlur={handleBlur}
              onChange={handleChange}
              type="email"
              value={values.email}
              placeholder="E-Mail"
            />
            {touched.email && errors.email && <small className="text-danger form-text">{errors.email}</small>}
          </div>
          <div className="form-group mb-3">
            <PhoneInput
              country={'tr'}
              inputProps={{
                name: 'phone_number',
                required: true,
                className: 'form-control'
              }}
              value={values.phone_number}
              onChange={(phone) => {
                handleChange({
                  target: {
                    name: 'phone_number',
                    value: phone,
                  },
                });
              }}
              onBlur={handleBlur}
              inputClass="w-100"
            />
            {touched.phone_number && errors.phone_number && (
              <small className="text-danger form-text">{errors.phone_number}</small>
            )}
          </div>
          <div className="form-group mb-4">
            <input
              className="form-control"
              name="password"
              onBlur={handleBlur}
              onChange={handleChange}
              type="password"
              value={values.password}
              placeholder="Password"
            />
            {touched.password && errors.password && <small className="text-danger form-text">{errors.password}</small>}
          </div>
          <div className="form-group mb-4">
            <input
              className="form-control"
              name="confirm_password"
              onBlur={handleBlur}
              onChange={handleChange}
              type="password"
              value={values.confirm_password}
              placeholder="Confirm Password"
            />
            {touched.confirm_password && errors.confirm_password && <small className="text-danger form-text">{errors.confirm_password}</small>}
          </div>

          {/*<div className="custom-control custom-checkbox text-start mb-4 mt-2">
            <input type="checkbox" className="custom-control-input mx-2" id="customCheck1" />
            <label className="custom-control-label" htmlFor="customCheck1">
              Save credentials.
            </label>
          </div>*/}

          {errors.submit && (
            <Col sm={12}>
              <Alert variant="danger">{errors.submit}</Alert>
            </Col>
          )}

          <Row>
            <Col mt={12}>
              <Button className="btn-block mb-12 signin-button" disabled={isSubmitting} size="large" type="submit" variant="primary">
                Signup
              </Button>
            </Col>
          </Row>
        </form>
      )}
    </Formik>
  );
};

export default JWTSignup;
