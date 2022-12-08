let productsData = [];
let cartData = [];
let cartTotal = 0;

// 初始化渲染
function init(){
    getProducts();
    getCart();
}

init();

// 取得產品資料
function getProducts(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`)
    .then(response=>{
        productsData = response.data.products;
        console.log(productsData);
        renderProducts(productsData);
    })
    .catch(error=>{
        if(!(error.response.data.status)){
            alert(error.response.data.message)
        }
    });
}

const productWrap = document.querySelector('.productWrap');
// 渲染產品菜單
function renderProducts(data){
    str = '';
    data.forEach(item=>{
        str += `
        <li class="productCard">
            <h4 class="productType">新品</h4>
            <img src=${item.images} alt="">
            <a href="#" class="addCardBtn" data-id=${item.id}>加入購物車</a>
            <h3>${item.title}</h3>
            <del class="originPrice">NT$${toCurrency(item.origin_price)}</del>
            <p class="nowPrice">NT$${toCurrency(item.price)}</p>
        </li>
        `
    });
    productWrap.innerHTML = str
}
// 篩選
const productSelect = document.querySelector('.productSelect');
productSelect.addEventListener('change',e=>{
    let selectData = [];
    productsData.forEach(item=>{
        if(item.category === e.target.value){
            selectData.push(item);
            // 每一遍 selectData 都渲染一遍... 假設有五筆 就會渲染五次
            // 第一次 渲染一個 被之後渲染的覆蓋 到最後一次 就會蒐集到全部的selectData 會蓋過前面渲染的
            renderProducts(selectData);
        }else if(e.target.value === '全部'){
            renderProducts(productsData);
        }
    });
});

// 取得購物車
function getCart(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    .then(response=>{
        console.log(response.data.carts);
        cartData = response.data.carts;
        cartTotal = response.data.finalTotal;
        renderCart();

    }).catch(error=>{
        if(!(error.response.data.status)){
            alert(error.response.data.message);
        }
    });
}

// 渲染購物車
const cartList = document.querySelector('.cartList');
const total = document.querySelector('.total');
function renderCart(){
    let str = "";
    cartData.forEach(item=>{
        str += `
                <tr class="cartItem">
                    <td>
                        <div class="cardItem-title">
                            <img src=${item.product.images} alt="">
                            <p>${item.product.title}</p>
                        </div>
                    </td>
                    <td>NT$${toCurrency(item.product.price)}</td>
                    <td class="align-middle">
                        <button><span data-id=${item.product.id}  data-cart-id=${item.id} data-num=${item.quantity} class="material-symbols-outlined">remove</span></button>
                        <input type="text" class="inputNum" data-id=${item.id} value=${item.quantity} />
                        <button><span data-id=${item.product.id} data-num=${item.quantity} class="material-symbols-outlined">add</span></button>
                    </td>
                    <td>NT$${toCurrency(item.product.price * item.quantity)}</td>
                    <td class="discardBtn">
                        <a href="#" class="material-icons" data-id=${item.id}>clear</a>
                    </td>
                </tr>
        `
        
    });
    cartList.innerHTML = str;

    let totalStr = "";
    if(cartData.length > 0){
        totalStr = `
            <tr>
                <td class="deleteAllBtn">
                    <a href="#" class="discardAllBtn">刪除所有品項</a>
                </td>
                <td></td>
                <td></td>
                <td>
                    <p>總金額</p>
                </td>
                <td>NT$${toCurrency(cartTotal)}</td>
            </tr>
        `
    }
    total.innerHTML = totalStr;
}

// 加入購物車 按太快會加到新的一列
productWrap.addEventListener('click',e=>{
    e.preventDefault();
    
    if(e.target.getAttribute('class') === "addCardBtn"){
        let num = 1;
        // 如果購物車已經有 num就+1 
        cartData.forEach(item=>{
            if(item.product.id === e.target.getAttribute('data-id')){
                num += item.quantity;
            }else{
                num = 1;
            }
        });

        axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,
        {
            "data": {
              "productId": e.target.getAttribute('data-id'),
              "quantity": num
            }
        }).then(response=>{
            console.log(response.data);
            getCart();
        });
    }
});

// 刪除所有購物車
total.addEventListener('click',e=>{
    e.preventDefault();
    if(e.target.getAttribute('class') === 'discardAllBtn'){
        axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
        .then(response=>{
            console.log(response.data);
            // 要重新獲得購物車資料再渲染
            getCart();
        })
    }
});

// 刪除單筆
cartList.addEventListener('click',e=>{
    e.preventDefault();
    if(e.target.textContent === 'clear'){
        let cartId = e.target.getAttribute('data-id');
        axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`)
        .then(response=>{
            console.log(response.data);
            getCart();
        })
    }
});

// 修改筆數 不適用一個個選不然很麻煩 要變成all
cartList.addEventListener('change',e=>{
    console.log(e.target.getAttribute('data-id'));
    axios.patch(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,
    {
        "data": {
          "id": e.target.getAttribute('data-id'),
        //   要是數字
          "quantity": Number(e.target.value)
        }
    }).then(response=>{
        console.log(response.data);
        getCart();
    })
});

// 加1按鈕
cartList.addEventListener('click',e=>{
    let num = Number(e.target.getAttribute('data-num')) + 1
    if(e.target.textContent === 'add'){
        axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,
        {
            "data": {
              "productId": e.target.getAttribute('data-id'),
              "quantity": num
            }
        }).then(response=>{
            console.log(response.data);
            getCart();
        });
    }
});

// 減1按鈕
cartList.addEventListener('click',e=>{
    if(e.target.textContent === 'remove'){
        if(e.target.getAttribute('data-num') == 1){
            let cartId = e.target.getAttribute('data-cart-id');
            axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`)
            .then(response=>{
                console.log(response.data);
                getCart();
            });
        }else{
            let num = Number(e.target.getAttribute('data-num')) - 1;
            axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,
            {
                "data": {
                  "productId": e.target.getAttribute('data-id'),
                  "quantity": num
                }
            }).then(response=>{
                console.log(response.data);
                getCart();
            });
        }
    }
});

// 新增訂單
const orderInfoBtn = document.querySelector('.orderInfo-btn');
const orderInfoInputs = [...document.querySelectorAll('.orderInfo-input')];
const orderInfoForm = document.querySelector('.orderInfo-form');
const orderInfoMessages = document.querySelectorAll('.orderInfo-message');
orderInfoBtn.addEventListener('click',e=>{
    e.preventDefault();
    let incomplete = orderInfoInputs.some(item=>{
        return item.value === '';
    });
    let errors = validate(orderInfoForm, constraints);

    if(incomplete){
        alert('請填寫完整資料！');
        return;
    }else if(errors){
        alert('請填寫正確資料！');
        return;
    }
    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,
    {
        "data": {
          "user": {
            "name": orderInfoInputs[0].value,
            "tel": orderInfoInputs[1].value,
            "email": orderInfoInputs[2].value,
            "address": orderInfoInputs[3].value,
            "payment": orderInfoInputs[4].value,
          }
        }
    }).then(response=>{
        console.log(response.data);  
        getCart();
        orderInfoForm.reset();
        alert('訂單已送出!');    
        orderInfoMessages.forEach(item=>{
            item.textContent = "";
        });

    }).catch(error=>{
        console.log(error.response.data);
    })
});


// 表單驗證 監聽全部輸入 透過blur 離開焦點觸發
orderInfoInputs.forEach(item=>{
    item.addEventListener('blur',e=>{
        // p標籤全部空字串
        item.nextElementSibling.textContent = "";
        let errors = validate(orderInfoForm, constraints);

        // 這邊如果換成 errors[e.target.getAttribute('id')] === undefined || errors === undefined 就會出現錯誤想知道如何解決?
        if(errors === undefined || errors[e.target.getAttribute('id')] === undefined){
            e.target.nextElementSibling.textContent = "驗證成功";
            e.target.nextElementSibling.classList.remove('failed');
            e.target.nextElementSibling.classList.add('success');
        }else if(errors){
            // 單一error沒了就可
            // 全部沒errors才可
            e.target.nextElementSibling.textContent = errors[e.target.getAttribute('id')];
            e.target.nextElementSibling.classList.remove('success')
            e.target.nextElementSibling.classList.add('failed');
        }
    })
})

// 表單驗證用 
const constraints = {
    customerName:{
        presence:{
            message: '必填'
        },
        length:{
            maximum:10,
            message: '不得超過10個字'
        }
    },
    customerPhone:{
        presence:{
            message:'必填'
        },
        format:{
            // 手機驗證 https://ithelp.ithome.com.tw/articles/10196283
            pattern: /^09[0-9]{8}$/,
            flags: "i",
            message: '請填寫正確的手機格式'
        }
    },
    customerEmail:{
        presence:{
            message:'必填'
        },
        // 信箱驗證 https://www.w3resource.com/javascript/form/email-validation.php
        format:{
            pattern: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            flags: "i",
            message: '請填寫正確的信箱格式'
        }
    },
    customerAddress:{
        presence:{
            message:'必填'
        },
    },
    tradeWay:{
        presence:{
            message:'必填'
        }
    }

}

// 監聽全部
orderInfoInputs.forEach(item=>{
    item.addEventListener('blur',e=>{
        // p標籤全部空字串
        item.nextElementSibling.textContent = "";
        let errors = validate(orderInfoForm, constraints);

        // 這邊如果換成 errors[e.target.getAttribute('id')] === undefined || errors === undefined 就會出現錯誤想知道如何解決?
        if(errors === undefined || errors[e.target.getAttribute('id')] === undefined){
            e.target.nextElementSibling.textContent = "驗證成功";
            e.target.nextElementSibling.classList.remove('failed')
            e.target.nextElementSibling.classList.add('success')
        }else if(errors){
            // 單一error沒了就可
            // 全部沒errors才可
            e.target.nextElementSibling.textContent = errors[e.target.getAttribute('id')];
            e.target.nextElementSibling.classList.remove('success')
            e.target.nextElementSibling.classList.add('failed')
        }
    })
})

// 千分位以上加上逗號 https://dotblogs.com.tw/AlenWu_coding_blog/2017/08/11/js_number_to_currency_comma
function toCurrency(num){
    var parts = num.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
}

