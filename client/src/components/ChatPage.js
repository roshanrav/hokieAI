import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import homeIcon from '../assets/home.png';
import dalleBot from '../assets/dalle_bot.jpg';
import sendButton from '../assets/send_button.png';
import styles from '../styles/ChatPage.module.css';
import user from '../assets/vt_student.jpg';
import { useAuthStore } from '../store/store'
import useFetch from '../hooks/fetch.hook';




const ChatPage = () => {
  const { category } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { prompt } = location.state || {};
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [messageHistory, setMessageHistory] = useState([]);
  const [quest, setQuest] = useState('');
  const studentName = "Roshan Ravindran";
  const [userName, setUserName] = useState('');
  const [userImage, setUserImage] = useState(user);
  const { username } = useAuthStore(state => state.auth)

  const [{ isLoading, apiData, serverError }] = useFetch(`/user/${username}`)


  useEffect(() => {
    const loadingElement = document.getElementById('loading');
    setTimeout(() => {
      if (loadingElement) loadingElement.style.display = 'none';
    }, 1500);
    // fetchUserData();
    // console.log("username" + username)
    // console.log(apiData?.firstName)
    // console.log(apiData?.profile)

    if (prompt) {
      initialChatGPT(prompt);
      console.log("the prompt is" + prompt)
    }
  }, [prompt]);
  useEffect(() => {
    console.log("Message History Updated:", messageHistory);
  }, [messageHistory]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const currentChatbot = getChatbotFromPrompt(String(urlParams));
    const selector = document.getElementById('category-selector');

    if (selector) {
      if (currentChatbot) {
        selector.value = currentChatbot;
      } else {
        selector.selectedIndex = 0;
      }
    }

    const prompt_url = urlParams.get('prompt');
    if (prompt_url) {
      setQuest(prompt_url);
    }
  }, []);
  useEffect(() => {
    const categorySelector = document.getElementById(styles.categorySelector);
    if (categorySelector) {
      const handleCategoryChange = function () {
        console.log("AFTER " + this.value);
        if (this.value) {
          console.log("username" + username)
          console.log(apiData?.firstName)
          console.log(apiData?.profile)
          setPromptForCategory(this.value);
      
        }
      };

      categorySelector.addEventListener('change', handleCategoryChange);

      // Cleanup event listener
      return () => {
        categorySelector.removeEventListener('change', handleCategoryChange);
      };
    }
  }, [apiData, username]);
  const handleHomeClick = () => {
    showLoading();
    setTimeout(() => {
      navigate('/chatbot');
    }, 1500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("clicked on the submit button")
    if (input.trim() === "") {
      return;
    }

    const newMessage = { role: 'user', content: input };
    console.log("input" + newMessage.role + newMessage.content)
    setMessages([...messages, newMessage]);
    setMessageHistory([...messageHistory, newMessage]);
    setInput('');

    await handleChatGPT(input);
  };

  const handleChatGPT = async (message) => {
    const uniqueId = generateUniqueId();
    const newMessage = { role: 'assistant', content: 'Loading...', id: uniqueId };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    messageHistory.concat([{ role: 'user', content: message }])

    const response = await sendMessageToChatGPT(messageHistory.concat([{ role: 'user', content: message }]));

    setMessages((prevMessages) => {
      const updatedMessages = [...prevMessages];
      const index = updatedMessages.findIndex(msg => msg.id === uniqueId);
      if (index !== -1) {
        updatedMessages[index].content = '';
        typeText(document.getElementById(uniqueId), response, () => handleYesNoButtons(response, uniqueId));
      }
      return updatedMessages;
    });

    setMessageHistory((prevHistory) => [...prevHistory, { role: 'assistant', content: response }]);
  };

  const initialChatGPT = async (initialPrompt) => {
    setQuest(initialPrompt);
    const initialMessage = { role: 'system', content: initialPrompt };

    setMessages([{ role: 'assistant', content: 'Loading...' }]);
    setMessageHistory([initialMessage]);
    const response = await InitialMessageToChatGPT(initialPrompt);
    setMessages([{ role: 'assistant', content: response }]);
        setMessageHistory((prevHistory) => [...prevHistory, { role: 'assistant', content: response }]);
    };
    // setMessageHistory([{ role: 'assistant', content: response }]);

  const sendMessageToChatGPT = async (promptMessages) => {
    console.log("after updating" , promptMessages);
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer API_KEY_HERE'
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: promptMessages
      })
    });
    const data = await response.json();
    if (data.choices && data.choices.length > 0) {
      const replyText = data.choices[0].message.content;
      return replyText;
    } else {
      return "Failed to get a response";
    }
  };

  const InitialMessageToChatGPT = async (quest) => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer API_KEY_HERE'
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "system", content: quest }]
      })
    });
    const data = await response.json();
    if (data.choices && data.choices.length > 0) {
      const replyText = data.choices[0].message.content;
      return replyText;
    } else {
      return "Failed to get a response";
    }
  };

  const chatbotMapping = {
    'Social': 'socialLife',
    'Academia': 'academia',
    'Wellness': 'wellness',
    'tutor': 'tutor'
  };

  const getChatbotFromPrompt = (urlPrompt) => {
    for (const key in chatbotMapping) {
      if (urlPrompt.includes(key)) {
        return chatbotMapping[key];
      }
    }
    return null;
  };

  const generateUniqueId = () => {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;
  };

  const chatStripe = (ai_bool, value, uniqueId) => {
    return `
      <div class="wrapper ${ai_bool ? styles.ai : ''}">
        <div class="chat">
          <div class="profile">
            <img
              src="${ai_bool ? dalleBot : user}"
              alt="${ai_bool ? "bot" : "user"}"
            />
          </div>
          <div class="message" id=${uniqueId}>${value}</div>
        </div>
      </div>
    `;
  };

  const loader = (element) => {
    element.textContent = "";
    let loadInterval = setInterval(() => {
      element.textContent += ".";
      if (element.textContent === "....") {
        element.textContent = "";
      }
    }, 300);
  };

  const typeText = (element, text, callback) => {
    let index = 0;
    let interval = setInterval(() => {
      if (index < text.length) {
        element.innerHTML += text.charAt(index);
        document.querySelector(`.${styles.chatContainer}`).scrollTop = document.querySelector(`.${styles.chatContainer}`).scrollHeight;
        ++index;
      } else {
        clearInterval(interval);
        if (callback) callback();
      }
    }, 20);
  };

  const generateEmailPrompt = (conversationHistory) => {
    return `
      You are a helpful assistant. Based on the following conversation history, generate a detailed and polite email for a Virginia Tech advisor. The email should be written from the perspective of a Virginia Tech student asking for more information or assistance based on their enquiry.

      Conversation History: ${conversationHistory.map(message => {
        return `\n${message.role === 'user' ? 'User' : 'Assistant'}: ${message.content}`;
      }).join('')}

      The name of the student is ${apiData?.firstName}

      Please ensure the email includes:
      - A formal greeting.
      - A clear and detailed description of the student's enquiry.
      - Relevant details or context that the student has provided.
      - A polite closing statement thanking the advisor for their time and asking for more detailed information or assistance.
      - Keep it short and professional

      The email should be structured formally and professionally, appropriate for a university setting.
    `;
  };

  const handleYesNoButtons = (replyText, uniqueId) => {
    if (replyText.toLowerCase().includes("help")) {
      const yesButton = document.createElement("button");
      yesButton.className = styles.yesButton; // Correct class name
      yesButton.textContent = "Yes";
      const noButton = document.createElement("button");
      noButton.className = styles.noButton; // Correct class name
      noButton.textContent = "No";

      const buttonContainer = document.createElement("div");
      buttonContainer.id = styles.buttonContainer; // Correct class name
      buttonContainer.appendChild(yesButton);
      buttonContainer.appendChild(noButton);
      document.querySelector(`.${styles.chatContainer}`).appendChild(buttonContainer);

      document.querySelector(`.${styles.chatContainer}`).scrollTop = document.querySelector(`.${styles.chatContainer}`).scrollHeight;

      noButton.addEventListener("click", () => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: 'user', content: "No" },
          { role: 'assistant', content: "Thank you! Please let me know if you have more questions." }
        ]);
        setMessageHistory((prevHistory) => [
          ...prevHistory,
          { role: 'user', content: "No" },
          { role: 'assistant', content: "Thank you! Please let me know if you have more questions." }
        ]);
        document.getElementById(styles.buttonContainer).remove();
        scrollToBottom();
      });
      yesButton.addEventListener("click", () => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { role: 'user', content: "Yes" },
            { role: 'assistant', content: "Would you like to email the advisor or continue the conversation?", id: uniqueId }
          ]);
          setMessageHistory((prevHistory) => [
            ...prevHistory,
            { role: 'user', content: "Yes" }
          ]);
          
          const responseDiv = document.createElement("div");
          responseDiv.id = styles.botMessage; // Correct class name
  
          const emailButton = document.createElement("button");
          emailButton.className = styles.responseButton; // Correct class name
          emailButton.textContent = "Email Advisor";
          const askMindcraftButton = document.createElement("button");
          askMindcraftButton.className = styles.responseButton; // Correct class name
          askMindcraftButton.textContent = "Continue Chat";
  
          responseDiv.appendChild(document.createElement("br"));
          responseDiv.appendChild(emailButton);
          responseDiv.appendChild(askMindcraftButton);
  
          // Append buttons directly after the last message
          scrollToBottom();
  
          setTimeout(() => {
            scrollToBottom();
            document.querySelector(`.${styles.chatContainer}`).appendChild(responseDiv);
            // const lastMessageElement = document.querySelector(`.${styles.chatContainer} .${styles.wrapper}:last-child`);
            // if (lastMessageElement) {
            //   lastMessageElement.appendChild(responseDiv);
            // }
  
            document.querySelector(`.${styles.chatContainer}`).scrollTop = document.querySelector(`.${styles.chatContainer}`).scrollHeight;
          }, 100);
          document.getElementById(styles.buttonContainer).remove();

        emailButton.addEventListener("click", async () => {
          setMessages((prevMessages) => [
            ...prevMessages,
            { role: 'user', content: "Yes, Please help me email my advisor" }
          ]);
          setMessageHistory((prevHistory) => [
            ...prevHistory,
            { role: 'user', content: "Yes, Please help me email my advisor" }
          ]);

          const emailPrompt = generateEmailPrompt(messageHistory);
          const emailResponse = await sendMessageToChatGPT([{ role: "user", content: emailPrompt }]);
          const subjectMatch = emailResponse.match(/Subject: (.*)\n/);
          const subject = subjectMatch ? subjectMatch[1] : "Inquiry";
          const body = emailResponse.replace(/Subject: .*?\n/, "");

          const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
          window.location.href = mailtoLink;

          document.getElementById(styles.botMessage).remove();
          setMessages((prevMessages) => [
            ...prevMessages,
            { role: 'assistant', content: "Hope I answered your question. Please let me know if you have more questions" }
          ]);
          setMessageHistory((prevHistory) => [
            ...prevHistory,
            { role: 'assistant', content: "Hope I answered your question. Please let me know if you have more questions" }
          ]);
        });
        scrollToBottom();

        askMindcraftButton.addEventListener("click", () => {
          setMessages((prevMessages) => [
            ...prevMessages,
            { role: 'user', content: "Continue chat" },
            { role: 'assistant', content: "Please provide more details or ask another question." }
          ]);
          setMessageHistory((prevHistory) => [
            ...prevHistory,
            { role: 'user', content: "Continue chat" },
            { role: 'assistant', content: "Please provide more details or ask another question." }
          ]);
          document.getElementById(styles.botMessage).remove();
        });
      });
      scrollToBottom();
    }
  };
  const setPromptForCategory = (category) => {
    const buttonContainer = document.getElementById(styles.buttonContainer);
    if (buttonContainer) {
      buttonContainer.remove();
    }
    const botMessage = document.getElementById(styles.botMessage);
    if (botMessage) {
      botMessage.remove();
    }
    let prompt;
    console.log("AFTER " + username + "username")
    console.log("AFTER " + apiData?.firstName)
    console.log(" AFTER " + apiData?.profile)
    switch (category) {
        case 'socialLife':
          prompt = `You are a college life coordinator for the real college called Virginia Polytechnic Institute and State University
              or Virginia Tech for short. Your job is to link resources and/or talk about activities you can do on campus in regards to social life.
              Your are essentially pulling information about ongoing campus events at Virginia Tech, what you can do as a college student on campus in and out of
              campus and outside in Blacksburg and nearby Christiansburg and Roanoke in Virginia. This also includes how to have fun with friends, groups, joining organizations
              and clubs, and doing all sorts of events and getting involved with extracurriculars. This includes stuff from 
              Gobblerconnect, a website that hosts event listinngs and club/organization listings
              you can join and in general calendars you can find by email like listserv notifications from organizations, and calendars embedded into the Virginia Tech college website
              and the calendar found on google or others found from related websites
              
              You will adhere to a consistent style of talking that is appropriate of a professional adult working a college job.
              
              You also are able to access the Internet to get links. Make sure they are working links and will not result in a 404 error.
              
              Your task is to provide answers to student's question in the text given as a college life coordinator by:
              
              1. Start with a greeting to the user by saying:"Hi ${apiData?.firstName}! Welcome to Mindcraft VT Assistant! My name is Mindcraft VT Social Life Assistant! What is/are your question(s) for today?
              
              2. Take the user input of the question and answer to the best of your abilities including adding links that users can click 
              
              3. If they are not in these categories OR they are out of the scope of what you can give users then say:
              "Sorry I don't believe I am able to answer your question in regards. Would you mind rewording your question or 
              answering a different one? If not thank you for using our service!:D" 
              
              4.  The output of your response should be first with a introductory paragraph of what your found. Then in a list format of 
              bullet points show all of the options, details, etc in terms of what you were trying to answer, BUT do not do this for most prompts if 
              it seems explicitly not needed. Instead if not needed, write in about 4-5 paragraphs explaining what you found. Finally have one final paragraph summarizing 
              the answer you found and then the final question where you ask the user specifically:
              "Do you need more help?"
              
              5. Following step 4 for the text "Does this answer your question?" If they say anything similar to the word "Yes" within context then say:
              "Hope this was helpful!" If the user says "No", prompt the user by saying: "Sure! What else do you want to know or need clarification about?" Proceed
              to then follow the previous steps starting from step 2. Use the question before as guidance and keep on topic. If they give an answer not on or similar to
              said topic or within the category then say "Sorry I don't believe I am able to answer your question in regards. Would you mind rewording your question or 
              answering a different one? If not thank you for using our service!:D`;
          break;
        case 'academia':
          prompt = `You are a academic advisor for the real college called Virginia Polytechnic Institute and State University
              or Virginia Tech for short. Your information is all essentially about courses, information on courses such as knowing what teacher is teaching or general heuristic knowledge about the class like 
              what they teach and how long each class is. This also can be about how to sign up for such a class, the steps to sign up, prerequisites, among ther logistical knowledge
              that is involved with courses. This can be about majors, pricing for credits, and anything related to classes, graduation, or a student's learning. This topic can also be
              a way to guide students on how to survive classes in general and strategies to survive and thrive in classes. Important deadlines and there important heuristics that 
              are constantly updates are listed here.
              
              You will adhere to a consistent style of talking that is appropriate of a professional adult working a college job.
              
              You also are able to access the Internet to get links. Make sure they are working links and will not result in a 404 error.
              
              Your task is to provide answers to student's question in the text given as a academic advisor by:
              
              1. Start with a greeting to the user by saying:"Hi ${apiData?.firstName}! Welcome to Mindcraft VT Assistant! My name is Mindcraft VT Academia Assistant! What is/are your question(s) for today?
              
              2. Take the user input of the question and answer to the best of your abilities including adding links that users can click 
              
              3. If they are not in these categories OR they are out of the scope of what you can give users then say:
              "Sorry I don't believe I am able to answer your question in regards. Would you mind rewording your question or 
              answering a different one? If not thank you for using our service!:D" 
              
              4.  The output of your response should be first with a introductory paragraph of what your found. Then in a list format of 
              bullet points show all of the options, details, etc in terms of what you were trying to answer, BUT do not do this for most prompts if 
              it seems explicitly not needed. Instead if not needed, write in about 4-5 paragraphs explaining what you found. Finally have one final paragraph summarizing 
              the answer you found and then the final question where you ask the user specifically:
              "Do you need more help?"
              
              5. Following step 4 for the text "Does this answer your question?" If they say anything similar to the word "Yes" within context then say:
              "Hope this was helpful!" If the user says "No", prompt the user by saying: "Sure! What else do you want to know or need clarification about?" Proceed
              to then follow the previous steps starting from step 2. Use the question before as guidance and keep on topic. If they give an answer not on or similar to
              said topic or within the category then say "Sorry I don't believe I am able to answer your question in regards. Would you mind rewording your question or 
              answering a different one? If not thank you for using our service!:D`;
          break;
        case 'wellness':
          prompt = `You are a embedded college counselor for the real college called Virginia Polytechnic Institute and State University
              or Virginia Tech for short. Your information is all essentially about resources for students. They can be exisiting outside resources around Blacksburg, Christiansburg, and Roanoke and inside campus resources. These resources include anything regarding 
              mental health, physical health, disability services, food and dietary support, financial aid and support, housing information and costs of living, and anything in general
              that regards useful everyday resources to help with the students needs that are listed currently on Virginia Tech on the websites and other affiliated resources. 
              
              You will adhere to a consistent style of talking that is appropriate of a professional adult working a college job.
              
              You also are able to access the Internet to get links. Make sure they are working links and will not result in a 404 error.
              
              Your task is to provide answers to student's question in the text given as a embedded college counselor by:
              
              1. Start with a greeting to the user by saying:"Hi ${apiData?.firstName}! Welcome to Mindcraft VT Assistant! My name is Mindcraft VT Wellness Assistant! What is/are your question(s) for today?
              
              2. Take the user input of the question and answer to the best of your abilities including adding links that users can click 
              
              3. If they are not in these categories OR they are out of the scope of what you can give users then say:
              "Sorry I don't believe I am able to answer your question in regards. Would you mind rewording your question or 
              answering a different one? If not thank you for using our service!:D" 
              
              4.  The output of your response should be first with a introductory paragraph of what your found. Then in a list format of 
              bullet points show all of the options, details, etc in terms of what you were trying to answer, BUT do not do this for most prompts if 
              it seems explicitly not needed. Instead if not needed, write in about 4-5 paragraphs explaining what you found. Finally have one final paragraph summarizing 
              the answer you found and then the final question where you ask the user specifically:
              "Do you need more help?"
              
              5. Following step 4 for the text "Does this answer your question?" If they say anything similar to the word "Yes" within context then say:
              "Hope this was helpful!" If the user says "No", prompt the user by saying: "Sure! What else do you want to know or need clarification about?" Proceed
              to then follow the previous steps starting from step 2. Use the question before as guidance and keep on topic. If they give an answer not on or similar to
              said topic or within the category then say "Sorry I don't believe I am able to answer your question in regards. Would you mind rewording your question or 
              answering a different one? If not thank you for using our service!:D
              `;
          break;
        case 'tutor':
          prompt = `You lead and have a list of tutors for the real college called Virginia Polytechnic Institute and State University
              or Virginia Tech for short. Your information is all essentially about giving information for students regarding listed tutors found. 
    
              You will adhere to a consistent style of talking that is appropriate of a professional adult working a college job.
    
              You also are able to access the Internet to get links. Make sure they are working links and will not result in a 404 error.
    
              Your task is to provide answers to student's question in the text given as an assitant that holds information regarding college tutorinng by:
    
              1. Starting with a greeting to the user by saying:"Hi ${apiData?.firstName}}! Welcome to Mindcraft VT Assistant! My name is Mindcraft VT Tutor Assistant! What is/are your question(s) for today?
    
              2. Take the user input of the question and answer to the best of your abilities including adding links that users can click 
    
              3. If they are not in these categories OR they are out of the scope of what you can give users then say:
              "Sorry I don't believe I am able to answer your question in regards. Would you mind rewording your question or 
              answering a different one? If not thank you for using our service!:D" 
    
              4.  The output of your response should be first with a introductory paragraph of what you found. Then in a list format of 
              bullet points show all of the options, details, etc in terms of what you were trying to answer. You should list in detail their name, introduction, rating, qualifications
              specialization with skills and subjects the tutor is good at, teaching approach, year if they are a current student or employee, reasonable pricing for a tutor, availability, contact phone number, 
              and social media. Then the final question where you ask the user specifically:
              "Do you need more help?"
    
              5. Following step 4 for the text "Does this answer your question?" If they say anything similar to the word "Yes" within context then say:
              "Hope this was helpful!" If the user says "No", prompt the user by saying: "Sure! What else do you want to know or need clarification about?" Proceed
              to then follow the previous steps starting from step 2. Use the question before as guidance and keep on topic. If they give an answer not on or similar to
              said topic or within the category then say "Sorry I don't believe I am able to answer your question in regards. Would you mind rewording your question or 
              answering a different one? If not thank you for using our service!:D"
    
              6. For the first prompt, Please dont include any tutor's name or details. Just greet the user as mentioned above. 
    
              NOTE: if you can't find a given tutor name or certain info:
    
              1. For no info at all make up a fake tutor with the guven info and make it similar to actual tutors you find.
    
              2. If you do find real tutors but not find all pieces of information you can try your best to find it but else say:
                  - "This is all the information I can find." This should be right before step 5 above.
                  - Also list the information as you do normally.
                  
              Please make sure to format this response logically as how actual tutor websites online do it (may use internet to find how)
              and list things in an order that is logical.
    
              `;
          break;
    
        default:
          prompt = "I'm not sure what you're asking. Can you specify a bit more?";
          break;
      }
    navigate(`/chatbot/${category}`, { state: { prompt } });
  };
  const showLoading = () => {
    document.getElementById('loading').style.display = 'flex';
  };
  const scrollToBottom = () => {
    const chatContainer = document.querySelector(`.${styles.chatContainer}`);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  };


  return (
    <div className={styles.chatPage}> {/* Apply the scoped class */}
    <div>
      <div
        id="loading"
        style={{
          position: 'fixed',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#861F41',
          zIndex: 1000,
        }}
      >
        <img src={dalleBot} id={styles.loadingImage} alt="loading" />
      </div>
      <div id={styles.app}>
        <div id={styles.header}>
          <button id={styles.homeButton} onClick={handleHomeClick}>
            <img src={homeIcon} alt="Home" />
          </button>
          <h1 id={styles.chatHeader}>MindCraft VT Chatbot</h1>
          <select id={styles.categorySelector} defaultValue={category}>
            <option value="socialLife">Social Life</option>
            <option value="academia">Academia</option>
            <option value="wellness">Wellness</option>
            <option value="tutor">Tutor</option>
          </select>
        </div>
        <div id={styles.chatContainer} className={styles.chatContainer}>
            {messages.map((msg, index) => (
              <div key={index} className={`${styles.wrapper} ${msg.role === 'assistant' ? styles.ai : ''}`}>
                <div className={styles.chat}>
                  <div className={styles.profile}>
                    <img src={msg.role === 'assistant' ? dalleBot : apiData?.profile || user } alt={msg.role} />
                  </div>
                  <div className={styles.message} id={msg.id}>{msg.content}</div>
                </div>
              </div>
            ))}
          </div>
        <form onSubmit={handleSubmit}>
          <textarea
            name="prompt"
            required
            rows="1"
            cols="1"
            placeholder="Ask MindCraft VT..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          ></textarea>
          <button type="submit" id={styles.submitButton} className={styles.submitButton}>
            <img src={sendButton} alt="Send" />
          </button>
        </form>
      </div>
    </div>
    </div>
  );
};

export default ChatPage;
