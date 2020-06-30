function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

Vue.component('quiz', {
  template:`
<div>
  <div v-if="introStage">
    <slot name="intro" :title="title">

      <div class="jumbotron">
        
        <div class="container">
                <h2 class="display-3">Bienvenid@ a OpositaLau, tu cuestionario online de Word 2010</h2>
                <p><a class="btn btn-primary btn-lg" href="#" role="button" @click="startQuiz">Empezar!</a></p>

                <div class="row justify-content-md-center">
                  <div class="col-lg-4 col-lg-offset-4">
                    <div class="input-group">
                      <div class="input-group-prepend">
                       <span class="input-group-text"">Número de preguntas:</span>
                      </div>
                      <input type="number" class="form-control" id="numberOfQuestions" v-model="numberOfQuestions">
                    </div>
                  </div>                
                  </div>    
          </div>
        </div>
    </slot>
  </div>
  
  <div v-if="questionStage">
    <question 
              :question="questions[currentQuestion]"
              v-on:answer="handleAnswer"
              :question-number="currentQuestion+1"
              :numberOfQuestions="numberOfQuestions"
    ></question>
  </div>
  
  <div v-if="resultsStage">
    <slot name="results" :length="questions.length" :perc="perc" :correct="correct">
      <div v-show="!hasLost">
        <img src="images/win.png"/>
        <h1>ENHORABUENA!!</h1>
      </div>
      <div v-show="hasLost">
        <img src="images/lose.png"/>
        <h1>VAYA!! SIGUE INTENTÁNDOLO</h1>
      </div>
      Has acertado {{correct}} de {{questions.length}} preguntas.
      El porcentaje es {{perc}}%.

        <table class="table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Pregunta</th>
              <th scope="col">Respuesta correcta</th>
              <th scope="col">Tu respuesta</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(question,index) in questions">
              <th scope="row" class="alert" v-bind:class="{ 'alert-danger': !marks[index], 'alert-success': marks[index] }">{{index+1}}</th>
              <td class="alert" v-bind:class="{ 'alert-danger': !marks[index], 'alert-success': marks[index] }">{{question.text}}</td>
              <td class="alert" v-bind:class="{ 'alert-danger': !marks[index], 'alert-success': marks[index] }">{{question.answer}}</td>
              <td class="alert" v-bind:class="{ 'alert-danger': !marks[index], 'alert-success': marks[index] }">{{answers[index]}}</td>
            </tr>
          </tbody>
        </table>
        <p><a class="btn btn-primary btn-lg" href="#" role="button" @click="reload">Volver al inicio</a></p>
    </slot>
  </div>
</div>
`,
  props:['url'],
  data() {
    return {
      numberOfQuestions: 15,
      minPercentToWin:50,
      hasLost:true,
      introStage:false,
      questionStage:false,
      resultsStage:false,
      title:'',
      questions:[],
      currentQuestion:0,
      answers:[],
      marks:[],
      correct:0,
      perc:null
    }
  },
  created() {    
    this.introStage = true;
  },
  methods:{
    startQuiz() {
      fetch(this.url)
      .then(res => res.json())
      .then(res => {
        this.title = res.title;
        this.questions = shuffle(res.questions).slice(0, this.numberOfQuestions);
        this.introStage = false;
        this.questionStage = true;
      })
    },
    handleAnswer(e) {
      console.log('answer event ftw',e);
      this.answers[this.currentQuestion]=e.answer;
      
      if((this.currentQuestion+1) === this.questions.length) {
        this.handleResults();
        this.questionStage = false;
        this.resultsStage = true;
      } else {
        this.currentQuestion++;
      }
    },
    handleResults() {
      console.log('handle results');
      this.questions.forEach((a, index) => {
        if(this.answers[index] && this.answers[index].replace(/\s/g, '').toUpperCase() === a.answer.replace(/\s/g, '').toUpperCase()) { 
          this.correct++;        
          this.marks.push(true);
        } else {
          this.marks.push(false);
        }
      });
      this.perc = ((this.correct / this.questions.length)*100).toFixed(2);
      console.log(this.correct+' '+this.perc);
      this.hasLost=this.perc<this.minPercentToWin;
      console.log('Has Lost:' + this.hasLost)
    },
    reload:function(){
      document.location.reload();
    }
  }
  
});

Vue.component('question', {
	template:`
<div class="container">
  <strong>#{{ questionNumber }}/ {{ numberOfQuestions }}:</strong><br/>
  <h3>{{ question.text }} </h3>

  <div v-if="question.type === 'tf'">
    <input type="radio" name="currentQuestion" id="trueAnswer" v-model="answer" value="t"><label for="trueAnswer">True</label><br/>
    <input type="radio" name="currentQuestion" id="falseAnswer" v-model="answer" value="f"><label for="falseAnswer">False</label><br/>
  </div>

  <div v-if="question.type === 'mc'">
    <div v-for="(mcanswer,index) in question.answers">
    <input type="radio" :id="'answer'+index" name="currentQuestion" v-model="answer" :value="mcanswer"><label :for="'answer'+index">{{mcanswer}}</label><br/>
    </div>
  </div>

  <div v-if="question.type === 'command'">
      <div v-show="isReadOnly" class="alert" role="alert" v-bind:class="{ 'alert-danger': hasError, 'alert-success': !hasError }">
      La respuesta correcta es: {{ correctAnswer }}
      </div>
      <div class="form-group">
        <label for="answer">Tu respuesta:</label>
        <input type="text" id="answer" autofocus v-on:keyup.enter="onEnter" class="form-control"  v-model="answer" placeholder="Ejemplo: ESCAPE+F1+0" value="" v-bind:readonly="isReadOnly" v-bind:class="{ 'is-invalid': hasError, 'is-valid': isCorrect }">
        <small id="emailHelp" class="form-text text-muted">Ejemplo: ESCAPE+F1+0</small>
        <button class="btn btn-success" id="validate" @click="validateAnswer" v-bind:disabled="isReadOnly">Validar</button>
        <button class="btn btn-danger" id="next" @click="nextQuestion" v-bind:disabled="!isReadOnly">Siguiente</button>            
      </div>
      
      <p>
      <p>
      <p>
      <a class="btn btn-primary" data-toggle="collapse" href="#collapseExample" role="button" aria-expanded="false" aria-controls="collapseExample">
      Guía de expresiones
      </a>
      </p>
      <div class="collapse" id="collapseExample">
        <div class="card card-body">
        <ul>
        <li><code>CTRL</code></li>
        <li><code>ALT</code></li>
        <li><code>MAYÚS</code></li>
        <li><code>ESCAPE</code></li>
        <li><code>ESPACIO</code></li>
        <li><code>retroceso</code></li>
        <li><code>Inicio</code></li>
        <li><code>Supr</code></li>
        <li><code>Intro</code></li>
        <li><code>TAB</code></li>
        <li><code>Fin</code></li>
        <li>Separador de comandos:+</li>
        </ul>
        </div>
      </div>
  </div>

  
</div>
`,
  data() {
     return {
       answer:'',
       correctAnswer:'',
       hasError:null,
       isCorrect:null,
       isReadOnly:false
     }
  },
	props:['question','question-number','numberOfQuestions'],
	methods:{
    onEnter:function() {
      if(!this.isReadOnly) {
        this.validateAnswer();
      } else {
        this.nextQuestion();
      }
    },
    validateAnswer:function() {
      this.isReadOnly=true;
      this.hasError=!(this.answer && this.answer.replace(/\s/g, '').toUpperCase() === this.question.answer.replace(/\s/g, '').toUpperCase());       
      //this.hasError=!(this.answer===this.question.answer)
      this.isCorrect=!this.hasError;
      console.log(this.hasError);
      this.correctAnswer=this.question.answer;
      console.log(this.question.answer);

    },
		nextQuestion:function() {
      console.log("nextQuestion called")
			this.$emit('answer', {answer:this.answer});
      this.answer = null;
      this.correctAnswer=null;
      this.isReadOnly=false;
      this.hasError=false;
      this.isCorrect=null;
		}
	}
});

const app = new Vue({
  el:'#quiz',
  data() {
    return {
    }
  }
})