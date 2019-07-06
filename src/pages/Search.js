import ReactDOM from 'react-dom'
import React, {Component, Fragment} from 'react';
import './Search.css';
import {faSearch} from  '@fortawesome/free-solid-svg-icons';
import {faStar} from  '@fortawesome/free-solid-svg-icons';
import {faStarHalf} from  '@fortawesome/free-solid-svg-icons';
import  { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from '@material-ui/core/Button';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import ListItem from "@material-ui/core/ListItem/ListItem";
import createClass from 'create-react-class';
import Header from './header.js';
import StarRating from './starRating'
import StarRatingComponent from 'react-star-rating-component';
import $ from 'jquery';
import axios from 'axios';
import qs from 'qs';
import Restaurant from "./Restaurant"
import "./index.css"




// noinspection JSAnnotator
var Search = createClass({


    getInitialState: function() {
        return {
            items:[],
            cat_list: [],
            ismounted : false,
            area : '',
            checkboxes:[],
            checkedItems: [],
            counts:[],
            boxStyle :{
                backgroundColor: 'white'
            },

        };

    },


    filterList: function(event){
        var updatedList =this.state.items;
        if(event.target.value) {
            updatedList = updatedList.filter(function (item) {
                return item.name.indexOf(event.target.value) > -1;

            });
            this.setState({items:updatedList});
        }
        else if(!(event.target.value)) {
            this.fetchApi();
        }
    },



    handleCheck: function(e) {
        let check_list = this.state.checkedItems;
        const item = e.target.name;
        const isChecked = e.target.checked;
        if(isChecked){
            this.setState({
                checkedItems: [...this.state.checkedItems, item]
            },this.fetchQueries)
        }else{

            var index = check_list.indexOf(item);
            if (index > -1) {
                check_list.splice(index, 1);
                this.setState({
                    checkedItems: check_list
                }, this.fetchApi)

            }
        }







    },

    fetchApi: function(){
        var url = 'http://localhost:5656/restaurants?area='+this.props.location.state.value ;




        fetch(url,{


        })
            .then(response => response.json())
            .then(resData => {

                this.setState({
                    items: resData.map(item => ({
                            address: item.address,
                            openingTime : item.openingTime,
                            closingTime : item.closingTime,
                            id: item.id,
                            comments: item.comments,
                            logo: item.logo,
                            averageRate : item.averageRate,
                            name : item.name,
                            categories_r : item.categories_r,

                        })
                    )
                });




            })

            .catch(error => {
                alert(error);
            });



    },

    countCategory(category) {
        var firstList = this.state.items;
        const countTypes = firstList.filter(item => item.categories_r.find( cat =>
            cat.category_name === category
        ));

        return countTypes.length


    },


    fetchQueries: function(){


        axios.get('http://localhost:5656/category',{
            params: {
                area: this.state.area,
                category:  this.state.checkedItems
            },
            paramsSerializer: params => {
                return qs.stringify(params)
            }
        })
            .then((Res) => {
                // handle success

                this.setState({
                    items: Res.data.map(item => ({
                            address: item.address,
                            openingTime : item.openingTime,
                            closingTime : item.closingTime,
                            id: item.id,
                            comments: item.comments,
                            logo: item.logo,
                            averageRate : item.averageRate,
                            name : item.name,
                            categories_r : item.categories_r,

                        })
                    )
                });


            })
            .catch(function (error) {
                // handle error
                alert(error);
            })
            .finally(function () {

            });


    },



    fetchCheckbox: function() {

        var url = 'http://localhost:5656/categoryCheckbox';


        fetch(url,{
            method: 'GET',

        })
            .then(function(response) {
                return response.json();
            })
            .then(resData => {

                this.setState({
                    checkboxes: resData.data

                });
            })


            .catch(error => {
                alert(error);
            });




    },


    createCheckBoxes: function (cats){
        return cats.map ( (item ,i) => {


            return (
                <div className={"categories-div"}>
                    <div className={"cat-box"}>
                        <input className={"checkbox-input"} name={item.name}   type="checkbox" onChange={e => this.handleCheck(e)}  />
                        <label className={"label-checkbox"} key={i}></label>
                        <label className={"cat_num"}>
                            <span className={"cat-text"} key={i}>{item.name}</span>
                            <span>({ this.countCategory(item.name)})</span>
                        </label>
                    </div>
                </div>


            );


        },);
    },




    createBoxes: function (items) {


        return  items.map(item =>  {
            return (



                <div className={"container"}>

                    <Link className="link-router" to={{  pathname:'/restpage' ,state: {
                            value : item.id
                        }
                    }}
                    >
                    <div className={"box-rest"} style={this.state.boxStyle} >

                        <div className={"info-rest"}>
                            <div className={"logo-rest-div"}>

                               <img src={item.logo} width={"90%"} height={"70%"} />

                            </div>

                            <div className={"data-div"}>

                                <div className={"name-rest-div"}><p className={"name-rest"}>{item.name}</p></div>
                                <div className={"star-holder-div"}></div>
                                <div className={"list-items"}>
                                    {item.categories_r.map((cat,i) =>
                                        <p className={"one-list-item"} >{cat.category_name}</p>
                                    )}
                                </div>

                                <address className="rest-address">{item.address.address_Line}</address>
                            </div>

                        </div>
                        <div className={"button-wrap"}>
                            <div className={"order-button-div"}>

                                <Button class={"order-button"}>شروع سفارش</Button>

                            </div>

                        </div>

                    </div>


                    </Link>

                    <Switch>

                        <Route path='/restpage' render={props => <Restaurant value={item.id} />} />
                    </Switch>
                </div>

            );
        },);
    },

    componentWillMount: function(){




        this.state.ismounted = true;
        this.fetchCheckbox();


        this.setState({area : this.props.location.state.value});
        this.fetchApi();

        if(this.state.checkedItems.length === 0 ){

            this.fetchApi();

        }





    },


    componentDidUpdate (){



        this.state.items.map((item) => {



            var current_time = new Date().getHours();

            var date1 = new Date(item.openingTime);
            var date2 = new Date(item.closingTime);

            var newDateOpen = date1.getHours();
            var newDateClose = date2.getHours();



            if (current_time > newDateClose ||
                current_time < newDateOpen ) {

                this.setState({
                    boxStyle :{
                        backgroundColor: '#b7b7b7'
                    },
                });
            }




        })


    },





    render(){

        const membersToRender = this.state.items;
        var num= membersToRender.length;




        return (

            <div>
                <Header></Header>
                <div className={"header-img"}></div>
                <div className={"info-rest"}>
                    <div className={"only-text-info"}>
                        <span>{num}</span> <span>رستوران امکان سرویس دهی به</span> <span>{this.state.area} </span> <span>را دارند</span>
                    </div>
                </div>
                <div className={"search-bar-div"}>
                    <input className={"search-bar-input"}  onChange={ this.filterList}/>
                    <label className={"label-input"}>جست و جوی رستوران در این محدوده</label>
                    <FontAwesomeIcon className={"faSearch-icon"} icon={faSearch}  size="0.6x" color="gray"/>

                </div>
                <div className={"rest-content"}>
                    <div className={"div-side-bar"} >
                        <div className={"filter-label"}>
                            <label >فیلتر بر اساس انواع غذا</label>
                        </div>
                        <div className={"search-category"}>
                            <input className={"search-category-input"} placeholder={"جست و جوی دسته بندی غذاها"}/>
                        </div>

                        {this.createCheckBoxes(this.state.checkboxes)}



                    </div>

                    <div className={"div-whole"} >

                        {this.createBoxes(this.state.items)}
                    </div>

                </div>

                <div className="final-part">
                    <div className="middle-part-container">
                        <div className="content-box">
                            <div className="right-content">
                                <span className="empty-space" />
                                <p className="note-text">
                                    مراقبت و محافظت از حساب کاربری و رمزعبور هر کاربر بر عهده کاربر است. ریحون سریعترین راه سفارش آنلاین غذا است. منوی عکس‌دار رستوران‌های اطرافتان را بر اساس مکان خود به راحتی مشاهده کنید و سفارش دهید.
                                </p>
                                <a className="list-rest-link">لیست رستوران ها</a>
                            </div>
                            <div className="extra-div">
                                <div className="left-content">
                                    <ul className="column1  first-pseudo">
                                        <li className="mobile-application-text">اپلیکیشن های موبایل</li>
                                        <li>
                                            <div className="download-app-column">
                                                <ul>
                                                    <li className="google-play">
                                                        <a />
                                                    </li>
                                                    <li className="ios-reyhoon">
                                                        <a />
                                                    </li>
                                                    <li className="bazar">
                                                        <a />
                                                    </li>
                                                </ul>
                                            </div>
                                        </li>
                                    </ul>
                                    <ul className="column1 second-pseudo">
                                        <li className="mobile-application-text">پشتیبانی ریحون</li>
                                        <li><a>سوالات متداول</a></li>
                                        <li><a>تماس با پشتیبانی</a></li>
                                        <li><a>قوانین و مقررات</a></li>
                                    </ul>
                                    <ul className="column1 third-pseudo">
                                        <li className="mobile-application-text">رستوران ها</li>
                                        <li><a>ثبت رستوران</a></li>
                                    </ul>
                                    <ul className="column1 fourth-pseudo">
                                        <li className="mobile-application-text">تماس با ریحون</li>
                                        <li><a>درباره ریحون</a></li>
                                        <li><a>تماس با ما</a></li>
                                        <li><a>وبلاگ ریحون</a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="two-logo-container">
                        <div className="logo-content">
                            <div className="logo-inner-photos">
                                <div className="logo-pic">
                                    <img src={require("../../pictures/logo2.png")} />
                                </div>
                                <div className="logo-pic">
                                    <img src={require("../../pictures/logo1.png")} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="footer-container">
                        <div className="footer-content">
                            <ul className="icons-container">
                                <li>
                                    <a>
                    <span className="icon-span">
                      <i className="fab fa-telegram-plane" />
                    </span>
                                    </a>
                                </li>
                                <li><a>
                    <span className="icon-span">
                      <i className="fab fa-facebook-f" />
                    </span>
                                </a></li>
                                <li><a>
                    <span className="icon-span">
                      <i className="fab fa-twitter" />
                    </span>
                                </a></li>
                                <li><a>
                    <span className="icon-span">
                      <i className="fab fa-instagram" />
                    </span>
                                </a></li>
                                <li><a>
                    <span className="icon-span">
                      <i className="fab fa-google-plus-g" />
                    </span>
                                </a></li>
                            </ul>
                            <p className="copyright-note">
                                © 2017, <a>Reyhoon</a>, All Rights Reserved.
                            </p>
                        </div>
                    </div>
                </div>


            </div>
        )

    }
});


export default Search;
