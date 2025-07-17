import React from 'react';
import { useNavigate } from 'react-router-dom'; // For navigation
import { Row, Col, Alert, Button } from 'react-bootstrap';
import * as Yup from 'yup';
import { Formik } from 'formik';
import Cookies from 'js-cookie'; // For cookies
import ApiService from './../../../services/ApiService';
import { GoogleLogin, useGoogleLogin } from '@react-oauth/google';
import { useTranslation } from 'react-i18next';

const JWTLogin = () => {

  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleLogin = async (values, { setSubmitting, setErrors }) => {
    try {
      // API'ye login isteği at
      const response = await ApiService.post('/auth/login', {
        user_name: values.user_name,
        password: values.password,
      });

      // Token veya kullanıcı bilgisi döndüyse işlem yap
      if (response.data.data.access_token) {
        Cookies.set('access_token', response.data.data.access_token, { expires: 7 });
        if(response.data.data.selected_feed_id) {
          Cookies.set('feed_id', response.data.data.selected_feed_id, { expires: 7 });
        }
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
      if(response.data.data.selected_feed_id) {
        Cookies.set('feed_id', response.data.data.selected_feed_id, { expires: 7 });
      }
      navigate('/dashboard');
      //window.location.href = '/dashboard';
    }
  };

  const googleLoginCustom = useGoogleLogin({
    flow: 'implicit', // ID Token döner, backend verifyIdToken kullanabilir
    onSuccess: async (credentialResponse) => {
      console.log('Login Successful:', credentialResponse);
      const response = await ApiService.post('/auth/google', {
        credential: credentialResponse.access_token
      });
  
      if (response.data.data.access_token) {
        Cookies.set('access_token', response.data.data.access_token, { expires: 7 });
        if (response.data.data.selected_feed_id) {
          Cookies.set('feed_id', response.data.data.selected_feed_id, { expires: 7 });
        }
        navigate('/dashboard');
      }
    },
    onError: () => {
      console.log('Google Login Failed');
    },
  });

  return (
    <Formik
      initialValues={{
        user_name: '',
        password: '',
        submit: null,
      }}
      validationSchema={Yup.object().shape({
        user_name: Yup.string().min(5).max(255).required('Username is required'),
        password: Yup.string().max(255).required('Password is required'),
      })}
      onSubmit={handleLogin} // handleLogin burada Formik'in onSubmit fonksiyonuna atanıyor
    >
      {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
        <form noValidate onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <input
              className="form-control"
              name="user_name"
              onBlur={handleBlur}
              onChange={handleChange}
              type="text"
              value={values.user_name}
              placeholder="Username"
            />
            {touched.user_name && errors.user_name && <small className="text-danger form-text">{errors.user_name}</small>}
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
                Signin
              </Button>
              <br />
              <div style={{ width: '100%', textAlign: 'center' }}>
              <Button
      onClick={() => googleLoginCustom()} // Dikkat: Hook fonksiyonu
      variant="light"
      className="w-100 mb-3 d-flex align-items-center justify-content-center google-login-button"
      
    >
      <img
        src="https://developers.google.com/identity/images/g-logo.png"
        alt="Google logo"
        style={{ width: 20, height: 20, marginRight: 8 }}
      />
      {t("Sign in with Google")}
    </Button> 
              </div>
              
              <br />
              
            </Col>
          </Row>
        </form>
      )}
    </Formik>
  );
};

export default JWTLogin;
