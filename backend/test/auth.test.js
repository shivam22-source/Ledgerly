const chai=require("chai")
const chaihttp=require("chai-http")
const app=require("../app")

chai.use(chaihttp);
const expect=chai.expect;

describe("Auth api Test",()=>{
    it("should register an user",(done)=>{
      chai.request(app)
      .post("/api/auth/register")
      .send({
        email:"shivam123@gmail.com",
        password:"Shivam@1234"
      })
      .end((err,res)=>{
        expect(res).to.have.status(201);
        done();
      })


    })

    it("Should loggined in",(done)=>{
   


        chai.request(app)
        .post("/api/auth/login")
        .send({
            email:"shivam123@gmail.com",
        password:"Shivam@1234"
        })
        .end((err,res)=>{
            expect(res).to.have.status(200);
            expect(res.body).to.have.property("accessToken");
            done();
        })
        
    })
})