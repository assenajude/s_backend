import compression from 'compression'
import helmet from "helmet";

export default  function(app){
    app.use(helmet())
    app.use(compression())
}