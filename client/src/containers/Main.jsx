import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import moment from "moment";
import API from "../utils/API";
import SideNav from "../components/SideNav";
import Welcome from "../components/Welcome";
import Charts from "../components/Charts";
import BudgetTable from "../components/BudgetTable";
import WalmartSearch from "../components/WalmartSearch";
import StockSearch from "../components/StockSearch";
import WalmartModal from "../components/WalmartModal";
import { Modal } from "reactstrap";
import { withStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import Hidden from "@material-ui/core/Hidden";
import AppBar from "@material-ui/core/AppBar";
import CssBaseline from "@material-ui/core/CssBaseline";
import Toolbar from "@material-ui/core/Toolbar";
import MenuIcon from "@material-ui/icons/Menu";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Main.css";

const drawerWidth = 300;

const styles = theme => ({
  root: {
    display: "flex"
  },
  drawer: {
    [theme.breakpoints.up("sm")]: {
      width: drawerWidth,
      flexShrink: 0
    }
  },
  appBar: {
    marginLeft: drawerWidth,
    [theme.breakpoints.up("sm")]: {
      width: `calc(100% - ${drawerWidth}px)`
    }
  },
  menuButton: {
    marginRight: 20,
    [theme.breakpoints.up("sm")]: {
      display: "none"
    }
  },
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    width: drawerWidth
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing.unit * 3,
    backgroundImage:
      "url(https://images.pexels.com/photos/326311/pexels-photo-326311.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260)"
  }
});

class Main extends Component {
  state = {
    isLoggedIn: true,
    username: "",
    itemToSearch: "",
    itemImages: [],
    mobileOpen: false,
    walmart: {},
    categoryRange: "",
    activePageHeader: "Dashboard",
    activePage: "Search",
    arrayForPieChart: [],
    arrayForBudgetTable: [],
    arrayForSumByIncome: [],
    budgetTotal: 0,
    totalIncome: 0,
    totalExpense: 0,
    arrayForTrueIncome: [],
    arrayForFalseIncome: [],
    monthLabels: [],
    modal: false,
    search: "",
    value: "",
    selectedBudgetItem: {},
    globalFilter: null,
    arrayForCatByCurrentMonth: [],
    stockToSearch: "",
    stockToSend: "",
    itemToDelete: ""
  };

  // Check login status on load
  componentDidMount() {
    this.loginCheck();
  }

  toggle = () => {
    this.setState({
      modal: !this.state.modal
    });

    if (!this.state.modal) {
      this.setState({ itemImages: [] });
    }
  };

  // Check login status
  loginCheck = () => {
    API.loginCheck()
      .then(res =>
        this.setState({
          isLoggedIn: res.data.isLoggedIn,
          username: res.data.username
        })
      )
      .then(res => {
        this.getCategorySum();
        this.getBudgetTable();
        this.getBudgetSum();
        this.getSumByMonthFalse();
        this.getSumByMonthTrue();
        this.createMonthLabels();
        this.getCategorySumForCurrentMonth();
      })
      .catch(err => {
        console.log(err);
        this.setState({ isLoggedIn: false });
      });
  };

  getBudgetTable = () => {
    API.getMonth().then(res => {
      // console.log("BUDGET DATA" + JSON.stringify(res.data));

      this.setState({ arrayForBudgetTable: res.data });
      console.log(
        "ARRAY FOR BUDGET DATA: " +
          JSON.stringify(this.state.arrayForBudgetTable)
      );
    });
  };

  getBudgetSum = () => {
    API.getSumByIncome().then(res => {
      console.log("BUDGET DATA" + JSON.stringify(res.data));

      this.setState({ arrayForSumByIncome: res.data }, this.setBudgetSum);
      console.log(
        "ARRAY FOR BUDGET SUM: " +
          JSON.stringify(this.state.arrayForSumByIncome)
      );
    });
  };

  setBudgetSum = () => {
    const { arrayForSumByIncome } = this.state;
    if (
      arrayForSumByIncome.length === 1 &&
      arrayForSumByIncome[0]._id.income === false
    ) {
      this.setState({
        budgetTotal: arrayForSumByIncome[0].budgetTotal * -1,
        totalExpense: arrayForSumByIncome[0].budgetTotal,
        totalIncome: 0
      });
    } else if (
      arrayForSumByIncome.length === 1 &&
      arrayForSumByIncome[0]._id.income === true
    ) {
      this.setState({
        budgetTotal: arrayForSumByIncome[0].budgetTotal,
        totalIncome: arrayForSumByIncome[0].budgetTotal,
        totalExpense: 0
      });
    } else if (arrayForSumByIncome.length === 2) {
      if (arrayForSumByIncome[0]._id.income === true) {
        let income = arrayForSumByIncome[0].budgetTotal;
        let expense = arrayForSumByIncome[1].budgetTotal;
        let budgetTotal = income - expense;
        this.setState({
          budgetTotal: budgetTotal,
          totalIncome: income,
          totalExpense: expense
        });
      }
      if (arrayForSumByIncome[0]._id.income === false) {
        let expense = arrayForSumByIncome[0].budgetTotal;
        let income = arrayForSumByIncome[1].budgetTotal;
        let budgetTotal = income - expense;
        this.setState({
          budgetTotal: budgetTotal,
          totalIncome: income,
          totalExpense: expense
        });
      }
    } else {
      this.setState({ budgetTotal: 0 });
    }
  };

  getCategorySumForCurrentMonth = () => {
    const thisYear = moment().format("YYYY");
    const thisMonth = moment().format("MM");

    API.getSumByCategory().then(res => {
      let categorySumList = [];

      let cat1 = res.data
        .filter(
          item =>
            item._id.category === "Health" &&
            item._id.year === thisYear &&
            item._id.month === thisMonth
        )
        .map(item => item.categoryTotal);

      let cat2 = res.data
        .filter(
          item =>
            item._id.category === "Home" &&
            item._id.year === thisYear &&
            item._id.month === thisMonth
        )
        .map(item => item.categoryTotal);

      let cat3 = res.data
        .filter(
          item =>
            item._id.category === "Other" &&
            item._id.year === thisYear &&
            item._id.month === thisMonth
        )
        .map(item => item.categoryTotal);

      let cat4 = res.data
        .filter(
          item =>
            item._id.category === "Savings" &&
            item._id.year === thisYear &&
            item._id.month === thisMonth
        )
        .map(item => item.categoryTotal);

      let cat5 = res.data
        .filter(
          item =>
            item._id.category === "Shopping" &&
            item._id.year === thisYear &&
            item._id.month === thisMonth
        )
        .map(item => item.categoryTotal);

      let cat6 = res.data
        .filter(
          item =>
            item._id.category === "Travel" &&
            item._id.year === thisYear &&
            item._id.month === thisMonth
        )
        .map(item => item.categoryTotal);

      let cat7 = res.data
        .filter(
          item =>
            item._id.category === "Utilities" &&
            item._id.year === thisYear &&
            item._id.month === thisMonth
        )
        .map(item => item.categoryTotal);

      categorySumList = [cat1, cat2, cat3, cat4, cat5, cat6, cat7];
      console.log(categorySumList);

      for (let i = 0; i < categorySumList.length; i++) {
        if (categorySumList[i].length > 1) {
          categorySumList[i] = [categorySumList[i].reduce((a, b) => a + b)];
        }
      }

      this.setState({ arrayForCatByCurrentMonth: categorySumList });
    });
  };

  getCategorySum = () => {
    API.getSumByCategory().then(res => {
      let categorySumList = [];
      console.log(res.data);

      let cat1 = res.data
        .filter(item => item._id.category === "Health")
        .map(item => item.categoryTotal);
      //console.log(cat1);
      let cat2 = res.data
        .filter(item => item._id.category === "Home")
        .map(item => item.categoryTotal);

      let cat3 = res.data
        .filter(item => item._id.category === "Other")
        .map(item => item.categoryTotal);

      let cat4 = res.data
        .filter(item => item._id.category === "Savings")
        .map(item => item.categoryTotal);

      let cat5 = res.data
        .filter(item => item._id.category === "Shopping")
        .map(item => item.categoryTotal);

      let cat6 = res.data
        .filter(item => item._id.category === "Travel")
        .map(item => item.categoryTotal);

      let cat7 = res.data
        .filter(item => item._id.category === "Utilities")
        .map(item => item.categoryTotal);

      categorySumList = [cat1, cat2, cat3, cat4, cat5, cat6, cat7];

      for (let i = 0; i < categorySumList.length; i++) {
        if (categorySumList[i].length > 1) {
          categorySumList[i] = [categorySumList[i].reduce((a, b) => a + b)];
        }
      }
      //console.log(
      //  "CATEGORY SUM LIST ARRAY: " + JSON.stringify(categorySumList));

      this.setState({ arrayForPieChart: categorySumList });
    });
  };

  getSumByMonthTrue = () => {
    const thisYear = moment().format("YYYY");

    API.getSumByMonthTrue().then(res => {
      let month1 = 0;
      let month2 = 0;
      let month3 = 0;
      let month4 = 0;
      let month5 = 0;
      let month6 = 0;

      let monthArray = [];

      // const monthCompare = moment()
      //   .subtract(2, "M")
      //   .format("MM YYYY");
      // month1 = res.data.filter(function(item) {
      //   let date = `${item._id.month} ${item._id.year}`;
      //   if (date === monthCompare) {
      //     return true;
      //   }
      // });
      // month1 = month1.map(function(item) {
      //   return item.budgetTotal;
      // });

      const monthCompare = moment()
        .subtract(2, "M")
        .format("MM");
      month1 = res.data
        .filter(
          item => item._id.month === monthCompare && item._id.year === thisYear
        )
        .map(item => item.budgetTotal);
      //console.log("MONTH ONE: " + JSON.stringify(month1));

      const monthCompare2 = moment()
        .subtract(1, "M")
        .format("MM");
      //console.log("COMPARE MONTH 2: " + monthCompare2);
      month2 = res.data
        .filter(
          item => item._id.month === monthCompare2 && item._id.year === thisYear
        )
        .map(item => item.budgetTotal);
      //console.log("MONTH TWO: " + JSON.stringify(month2));

      const monthCompare3 = moment().format("MM");
      //console.log("MONTH COMPARISON THREE: " + monthCompare3);
      month3 = res.data
        .filter(
          item => item._id.month === monthCompare3 && item._id.year === thisYear
        )
        .map(item => item.budgetTotal);
      //console.log("MONTH THREE: " + JSON.stringify(month3));

      const monthCompare4 = moment()
        .add(1, "M")
        .format("MM");
      res.data
        .filter(
          item => item._id.month === monthCompare4 && item._id.year === thisYear
        )
        .map(item => item.budgetTotal);
      //console.log("MONTH FOUR: " + JSON.stringify(month4));

      const monthCompare5 = moment()
        .add(2, "M")
        .format("MM");
      month5 = res.data
        .filter(
          item => item._id.month === monthCompare5 && item._id.year === thisYear
        )
        .map(item => item.budgetTotal);
      //console.log("MONTH FIVE: " + JSON.stringify(month5));

      const monthCompare6 = moment()
        .add(3, "M")
        .format("MM");
      month6 = res.data
        .filter(
          item => item._id.month === monthCompare6 && item._id.year === thisYear
        )
        .map(item => item.budgetTotal);
      //console.log("MONTH SIX: " + JSON.stringify(month6));

      monthArray = [month1, month2, month3, month4, month5, month6];
      //console.log("FULL SIX MONTH ARRAY: " + monthArray);

      this.setState({ arrayForTrueIncome: monthArray });
    });
  };

  getSumByMonthFalse = () => {
    const thisYear = moment().format("YYYY");
    API.getSumByMonthFalse().then(res => {
      let month1 = 0;
      let month2 = 0;
      let month3 = 0;
      let month4 = 0;
      let month5 = 0;
      let month6 = 0;

      let monthArray = [];

      const monthCompare = moment()
        .subtract(2, "M")
        .format("MM");
      month1 = res.data
        .filter(
          item => item._id.month === monthCompare && item._id.year === thisYear
        )
        .map(item => item.budgetTotal);
      //console.log("MONTH ONE: " + JSON.stringify(month1));

      const monthCompare2 = moment()
        .subtract(1, "M")
        .format("MM");
      month2 = res.data
        .filter(
          item => item._id.month === monthCompare2 && item._id.year === thisYear
        )
        .map(item => item.budgetTotal);
      //console.log("MONTH TWO: " + JSON.stringify(month2));

      const monthCompare3 = moment().format("MM");
      month3 = res.data
        .filter(
          item => item._id.month === monthCompare3 && item._id.year === thisYear
        )
        .map(item => item.budgetTotal);
      //console.log("MONTH THREE: " + JSON.stringify(month3));

      const monthCompare4 = moment()
        .add(1, "M")
        .format("MM");
      month4 = res.data
        .filter(
          item => item._id.month === monthCompare4 && item._id.year === thisYear
        )
        .map(item => item.budgetTotal);
      //console.log("MONTH FOUR: " + JSON.stringify(month4));

      const monthCompare5 = moment()
        .add(2, "M")
        .format("MM");
      month5 = res.data
        .filter(
          item => item._id.month === monthCompare5 && item._id.year === thisYear
        )
        .map(item => item.budgetTotal);
      //console.log("MONTH FIVE: " + JSON.stringify(month5));

      const monthCompare6 = moment()
        .add(3, "M")
        .format("MM");
      month6 = res.data
        .filter(
          item => item._id.month === monthCompare6 && item._id.year === thisYear
        )
        .map(item => item.budgetTotal);
      //console.log("MONTH SIX: " + JSON.stringify(month6));

      monthArray = [month1, month2, month3, month4, month5, month6];
      //console.log("FULL SIX MONTH ARRAY: " + monthArray);

      this.setState({ arrayForFalseIncome: monthArray });
    });
  };

  deleteItem = event => {
    const { value } = event.target;
    this.setState({ itemToDelete: value }, this.handleClickDelete);
  };

  handleClickDelete = event => {
    API.getDelete(this.state.itemToDelete)
      .then(res => {
        //console.log(res.data);
        this.getCategorySum();
        this.getBudgetTable();
        this.getBudgetSum();
        this.getSumByMonthFalse();
        this.getSumByMonthTrue();
        this.getCategorySumForCurrentMonth();
        this.notifyRemoval();
      })
      .catch(err => {
        console.log(err);
        this.notifyError();
      });
  };

  handleItemDelete = event => {
    API.getDelete(event.data._id)
      .then(res => {
        //console.log(res.data);
        this.getCategorySum();
        this.getBudgetTable();
        this.getBudgetSum();
        this.getSumByMonthFalse();
        this.getSumByMonthTrue();
        this.getCategorySumForCurrentMonth();
        this.notifyRemoval();
      })
      .catch(err => {
        console.log(err);
        this.notifyError();
      });
  };

  handleInputChange = event => {
    const { name, value } = event.target;
    this.setState({
      [name]: value
    });
  };

  handleSearch = event => {
    event.preventDefault();
    this.toggle();
    API.searchWalmart(this.state.itemToSearch)
      .then(res => {
        API.getWalmart()
          .then(res => {
            this.setState({
              itemImages: res.data,
              itemToSearch: ""
            });
          })
          .catch(err => console.log(err));
      })
      .catch(err => {
        this.notifyError();
        console.log(err);
      });
  };

  handleStockSearch = () => {
    this.setState({ stockToSend: this.state.stockToSearch });
    this.setState({ stockToSearch: "" });
  };

  notifySubmit = () => {
    toast.success("Item successfully added to budget.", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true
    });
  };

  notifyRemoval = () => {
    toast.error("Item successfully removed from budget.", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true
    });
  };

  notifyError = () => {
    toast.error("Error. Please try again", {
      position: "top-left",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true
    });
  };

  handleWalmartSubmit = event => {
    event.preventDefault();
    const { value, name } = event.target;

    let walmartObject = {
      description: name,
      amount: value,
      date: moment().format("L"),
      income: false,
      category: "Shopping"
    };

    this.setState({ walmart: walmartObject });

    API.budgetPost(walmartObject)
      .then(res => {
        //console.log(res);
        //console.warn("WALMART STATE OBJECT: " + this.state.walmart);
        this.getCategorySum();
        this.getBudgetTable();
        this.getBudgetSum();
        this.getSumByMonthFalse();
        this.getSumByMonthTrue();
        this.getCategorySumForCurrentMonth();
        this.notifySubmit();
        this.toggle();
      })
      .catch(err => {
        console.log(err);
        this.toggle();
        this.notifyError();
      });

    this.setState({ itemImages: [] });
  };

  tableSelectedChange = event => {
    this.setState({ selectedBudgetItem: event.value });
    console.log(this.state.selectedBudgetItem);
  };

  exportBudget = () => {
    this.dt.exportCSV();
  };

  createRef = el => {
    this.dt = el;
  };

  createMonthLabels = () => {
    const barChartLabels = [];

    const firstMonth = moment()
      .subtract(2, "M")
      .format("MMMM");
    barChartLabels.push(firstMonth);

    const secondMonth = moment()
      .subtract(1, "M")
      .format("MMMM");
    barChartLabels.push(secondMonth);

    const thirdMonth = moment().format("MMMM");
    barChartLabels.push(thirdMonth);

    for (let i = 1; i < 4; i++) {
      let newMonth = moment()
        .add(i, "M")
        .format("MMMM");
      barChartLabels.push(newMonth);
    }
    //console.log("MONTH LABELS: " + barChartLabels);
    this.setState({ monthLabels: barChartLabels });
  };

  handleDrawerToggle = () => {
    this.setState({
      mobileOpen: !this.state.mobileOpen
    });
  };

  render() {
    // If user isn't logged in, don't let them see this page
    if (!this.state.isLoggedIn) {
      return <Redirect to="/login" />;
    }

    console.log(this.state);

    const { classes, theme } = this.props;

    return (
      <div className={classes.root}>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnVisibilityChange
          draggable
          pauseOnHover
        />
        {/* Same as */}
        <ToastContainer />
        <CssBaseline />
        <AppBar position="fixed" color="inherit" className={classes.appBar}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="Open drawer"
              onClick={this.handleDrawerToggle}
              className={classes.menuButton}
            >
              <MenuIcon />
            </IconButton>
            <div className="d-flex">
              <div className="dashtext">{this.state.activePageHeader}</div>
              <div className="dashtext">
                {"\u00A0"}
                {`- ${this.state.username}`}
              </div>
            </div>
          </Toolbar>
        </AppBar>
        <nav className={classes.drawer}>
          <Hidden smUp implementation="css">
            <Drawer
              container={this.props.container}
              variant="temporary"
              anchor={theme.direction === "rtl" ? "right" : "left"}
              open={this.state.mobileOpen}
              onClose={this.handleDrawerToggle}
              classes={{
                paper: classes.drawerPaper
              }}
              ModalProps={{
                keepMounted: true
              }}
            >
              <SideNav
                activePage={this.state.activePage}
                getCategorySum={this.getCategorySum}
                getBudgetSum={this.getBudgetSum}
                getBudgetTable={this.getBudgetTable}
                getSumByMonthFalse={this.getSumByMonthFalse}
                getSumByMonthTrue={this.getSumByMonthTrue}
                getCategorySumForCurrentMonth={
                  this.getCategorySumForCurrentMonth
                }
              />
            </Drawer>
          </Hidden>
          <Hidden xsDown implementation="css">
            <Drawer
              classes={{
                paper: classes.drawerPaper
              }}
              variant="permanent"
              open
            >
              <SideNav
                activePage={this.state.activePage}
                getCategorySum={this.getCategorySum}
                getBudgetSum={this.getBudgetSum}
                getBudgetTable={this.getBudgetTable}
                getSumByMonthFalse={this.getSumByMonthFalse}
                getSumByMonthTrue={this.getSumByMonthTrue}
                getCategorySumForCurrentMonth={
                  this.getCategorySumForCurrentMonth
                }
              />
            </Drawer>
          </Hidden>
        </nav>
        <main className={classes.content}>
          <div className={classes.toolbar} />
          {this.state.arrayForBudgetTable.length === 0 ? (
            <Welcome />
          ) : (
            <div>
              <BudgetTable
                arrayForBudgetTable={this.state.arrayForBudgetTable}
                selectedBudgetItem={this.state.selectedBudgetItem}
                tableSelectedChange={this.tableSelectedChange}
                handleItemDelete={this.handleItemDelete}
                exportBudget={this.exportBudget}
                createRef={this.createRef}
                expenses={this.state.totalExpense}
                income={this.state.totalIncome}
                budgetTotal={this.state.budgetTotal}
                deleteItem={this.deleteItem}
              />
              <Charts
                trueIncome={this.state.arrayForTrueIncome}
                falseIncome={this.state.arrayForFalseIncome}
                pieChart={this.state.arrayForPieChart}
                monthLabels={this.state.monthLabels}
                arrayForCatByCurrentMonth={this.state.arrayForCatByCurrentMonth}
                budgetTotal={this.state.budgetTotal}
                arrayForBudgetTable={this.state.arrayForBudgetTable}
              />
            </div>
          )}
          <WalmartSearch
            itemToSearch={this.state.itemToSearch}
            handleInputChange={this.handleInputChange}
            handleSearch={this.handleSearch}
          />
          <StockSearch
            stockToSearch={this.state.stockToSearch}
            handleInputChange={this.handleInputChange}
            handleStockSearch={this.handleStockSearch}
            stockToSend={this.state.stockToSend}
          />
          <div>
            <Grid container justify="center">
              <Modal
                style={{ marginTop: 80 }}
                isOpen={this.state.modal}
                toggle={this.toggle}
                className={this.props.className}
                id="modalContainer"
              >
                <WalmartModal
                  toggle={this.toggle}
                  className="walmartModal"
                  itemImages={this.state.itemImages}
                  walmartSubmit={this.handleWalmartSubmit}
                />
              </Modal>
            </Grid>
          </div>
          <br />
          <br />
        </main>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(Main);
