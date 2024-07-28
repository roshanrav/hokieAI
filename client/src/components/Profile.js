import React, { useState } from 'react'
import avatar from '../assets/profile.png';
import toast, { Toaster } from 'react-hot-toast';
import { useFormik } from 'formik';
import { profileValidation } from '../helper/validate';
import convertToBase64 from '../helper/convert';
import useFetch from '../hooks/fetch.hook';
import { updateUser } from '../helper/helper'
import { useNavigate } from 'react-router-dom'
import calendar from '../assets/calendar.png'
import { ClipLoader } from 'react-spinners';

import uploadIcon from '../assets/upload.png'; // Add this line
import generateIcon from '../assets/generate.png'; // Add this line

import styles from '../styles/Username.module.css';
import extend from '../styles/Profile.module.css'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import axios from 'axios';

export default function Profile() {

  const [file, setFile] = useState();
  const [{ isLoading, apiData, serverError }] = useFetch();
  const navigate = useNavigate()

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
 
  const formik = useFormik({
    initialValues: {
      firstName: apiData?.firstName || '',
      lastName: apiData?.lastName || '',
      email: apiData?.email || '',
      advisorEmail: apiData?.advisorEmail || '',
      advisorFirstName: apiData?.advisorFirstName || '',
      advisorLastName: apiData?.advisorLastName || '',
      major: apiData?.major || '',
      standing: apiData?.standing || 'freshman'
    },
    enableReinitialize: true,
    validate : profileValidation,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit : async values => {
      values = await Object.assign(values, { profile : file || apiData?.profile || ''})
      let updatePromise = updateUser({ id: apiData?.id, ...values });

      toast.promise(updatePromise, {
        loading: 'Updating...',
        success : <b>Update Successfully...!</b>,
        error: <b>Could not Update!</b>
      });

    }
  })

  /** formik doensn't support file upload so we need to create this handler */
  const onUpload = async e => {
    const base64 = await convertToBase64(e.target.files[0]);
    setFile(base64);
  };

  //here
  const handleProfilePictureClick = () => {
    setUploadDialogOpen(true);
  };

  const handleUploadPicture = async (event) => {
    const file = event.target.files[0];
    const base64 = await convertToBase64(file);
    setFile(base64);
    setUploadDialogOpen(false);
  };

  // const handleGeneratePicture = async () => {
  //   // try {
  //   //   const response = await axios.post('https://api.openai.com/v1/dalle/generate', {
  //   //     prompt,
  //   //     n: 1,
  //   //     size: "1024x1024"
  //   //   }, {
  //   //     headers: {
  //   //       'Authorization': `Bearer sk-proj-ClyheMv50nSvIf1Q3g84T3BlbkFJoZ6isdGyOQEQcCm8GlzN`
  //   //     }
  //   //   });
  // //   try{
  // //     const response = await fetch('https://api.openai.com/v1/images/generations', {
  // //     method: 'POST',
  // //     headers: {
  // //       'Content-Type': 'application/json',
  // //       'Authorization': 'Bearer sk-proj-ClyheMv50nSvIf1Q3g84T3BlbkFJoZ6isdGyOQEQcCm8GlzN'
  // //     },
  // //     body: JSON.stringify({
  // //       model: "dall-e-3",
  // //       prompt: prompt,
  // //     })
  // //   });
  // //   const data = await response.json();
  // //   if (data.choices && data.choices.length > 0) {
  // //     console.log("working")
  // //     const replyText = data.choices[0].message.content;
  // //     return replyText;
  // //   } else {
  // //     return "Failed to get a response";
  // //   }
  // // }


  // //     const imageUrl = response.data.data[0].url;
  // //     setFile(imageUrl);
  // //     toast.success("Image generated successfully!");
  //    catch (error) {
  //     console.error('Error generating picture:', error);
  //     toast.error("Error generating picture");
  //   }
  //   setGenerateDialogOpen(false);
  // };
  const handleGeneratePicture = async () => {
    setLoading(true);
    try {
      const fullPrompt = `${prompt}`;
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sk-proj-ClyheMv50nSvIf1Q3g84T3BlbkFJoZ6isdGyOQEQcCm8GlzN'
        },
        body: JSON.stringify({
          prompt: prompt,
          n: 1,
          size: "1024x1024"
        })
      });
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        const imageUrl = data.data[0].url;
        console.log("Image URL:", imageUrl);
        setFile(imageUrl);
        toast.success("Image generated successfully!");
      } else {
        toast.error("Failed to get a response");
      }
    } catch (error) {
      console.error('Error generating picture:', error);
      toast.error("Error generating picture");
    }
    finally {
      setLoading(false);
    }
  };
  

  // logout handler function
  function userLogout(){
    localStorage.removeItem('token');
    navigate('/')
  }

  if(isLoading) return <h1 className='text-2xl font-bold'>isLoading</h1>;
  if(serverError) return <h1 className='text-xl text-red-500'>{serverError.message}</h1>

  return (
    <div className={extend.ProfilePage}> {/* Apply the scoped class */}
    <div className="container mx-auto">

      <Toaster position='top-center' reverseOrder={false}></Toaster>
      <button 
        onClick={() => navigate('/chatbot')} 
        style={{ 
          position: 'absolute', 
          top: '20px', 
          left: '20px', 
          padding: '0.75rem', 
          borderRadius: '0.5rem', 
          background: '#6366f1', 
          color: 'white', 
          fontWeight: 'bold', 
          textAlign: 'center', 
          cursor: 'pointer', 
          transition: 'background-color 0.2s',
          marginLeft: '30px'
        }}
      >
        Back to Chat
      </button>

      <div className='flex justify-center items-center h-screen'>
        <div className={`${styles.glass} ${extend.glass}`} style={{ width: "45%", paddingTop: '2.2em'}}>

          <div className="title flex flex-col items-center" style={{ margintop: '10px', marginBottom : '5px' }}>
            <h4 className='text-5xl font-bold'>Profile</h4>
            <span className='py-4 text-xl w-2/3 text-center'>
                Update your profile
            </span>
          </div>

          <form className='py-1' onSubmit={formik.handleSubmit}>
              {/* <div className='profile flex justify-center'>
                  <label htmlFor="profile">
                  <img src={file || apiData?.profile || avatar} className={`${styles.profile_img} ${extend.profile_img}`} alt="avatar" />

                  </label>
                  
                  <input onChange={onUpload} type="file" id='profile' name='profile' />
                  <a href="http://localhost:8080/auth">
                    <button className={`link ${styles.btn} ${extend.btn}`} type="button">Link your Microsoft Calendar</button>
                  </a>
              </div> */}
              <div className='profile flex flex-row items-center gap-4'>
              <label htmlFor="profile">
              <img src={file || apiData?.profile || avatar} className={`${styles.profile_img} ${extend.profile_img}`} alt="avatar" onClick={handleProfilePictureClick} />
              {loading && (
                  <div className={`${extend.loaderContainer}`}>
                    <ClipLoader color="#6366f1" loading={loading} size={50} />
                  </div>
                )}
              </label>
              {/* <input onChange={onUpload} type="file" id='profile' name='profile' className="hidden" /> */}
              <a href="http://localhost:8080/auth" className={`${extend.linkbtn}`}>
                <i className="fas fa-calendar-alt"></i>
                Link your Microsoft Calendar
                <img src={calendar} className={`${extend.calen}`}></img>
              </a>
            </div>

              <div className="textbox flex flex-col items-center gap-6">
                <div className="name flex w-3/4 gap-10">
                  <input {...formik.getFieldProps('firstName')} className={`${styles.textbox} ${extend.textbox}`} type="text" placeholder='FirstName' />
                  <input {...formik.getFieldProps('lastName')} className={`${styles.textbox} ${extend.textbox}`} type="text" placeholder='LastName' />
                </div>

                <div className="name flex w-3/4 gap-10">
                <input {...formik.getFieldProps('email')} className={`${styles.textbox} ${extend.textbox}`} type="text" placeholder='Email*' />
                <input {...formik.getFieldProps('advisorEmail')} className={`${styles.textbox} ${extend.textbox}`} type="text" placeholder='Advisor Email' />
                </div>
                <div className="name flex w-3/4 gap-10">
                <input {...formik.getFieldProps('advisorFirstName')} className={`${styles.textbox} ${extend.textbox}`} type="text" placeholder='Advisor First Name' />
                <input {...formik.getFieldProps('advisorLastName')} className={`${styles.textbox} ${extend.textbox}`} type="text" placeholder='Advisor Last Name' />
                </div>
                <div className="name flex w-3/4 gap-10">
                <input {...formik.getFieldProps('major')} className={`${styles.textbox} ${extend.textbox}`} type="text" placeholder='Major' />

                  <select {...formik.getFieldProps('standing')} className={`${styles.textbox} ${extend.textbox}`}>
                    <option value="freshman">Freshman</option>
                    <option value="sophomore">Sophomore</option>
                    <option value="junior">Junior</option>
                    <option value="senior">Senior</option>
                    <option value="graduate">Graduate</option>
                  </select>
                </div>

               
                  {/* <input {...formik.getFieldProps('address')} className={`${styles.textbox} ${extend.textbox}`} type="text" placeholder='Address' /> */}
                  <button className={styles.btn} type='submit'>Update</button>
               
                  
              </div>

              <div className="text-center py-4">
                <span className='text-gray-500'>want to logout? <button onClick={userLogout} className='text-red-500' to="/">Logout</button></span>
              </div>

              


          </form>
          <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} classes={{ paper: extend.dialogForProfile }}>
            <DialogTitle>Upload or Generate Profile Picture</DialogTitle>
            <DialogContent className={extend.dialogButtonsContainer}>
              <Button variant="contained" component="label" className={extend.dialogButtonForProfile}>
                <img src={uploadIcon} alt="Upload" /> Upload Picture
                <input type="file" hidden onChange={handleUploadPicture} />
              </Button>
              <Button variant="contained" onClick={() => { setUploadDialogOpen(false); setGenerateDialogOpen(true); }} className={extend.dialogButtonForProfile}>
                <img src={generateIcon} alt="Generate" /> Generate Picture
              </Button>
            </DialogContent>
          </Dialog>

          <Dialog open={generateDialogOpen} onClose={() => setGenerateDialogOpen(false)} classes={{ paper: extend.dialogForProfile }}>
            <DialogTitle>Generate Profile Picture</DialogTitle>
            <DialogContent>
              <TextField
                label="Enter prompt"
                fullWidth
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className={extend.dialogInput}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleGeneratePicture} className={extend.dialogButtonForProfile}>Generate</Button>
              <Button onClick={() => setGenerateDialogOpen(false)} className={extend.dialogButtonForProfile}>Cancel</Button>
            </DialogActions>
          </Dialog>
        </div>
      </div>
    </div>
    </div>
  )
}

