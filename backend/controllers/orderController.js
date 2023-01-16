const Order = require("../models/orderModel");
const User = require("../models/userModel");
const Product = require("../models/productModal");
const asyncHandler = require("express-async-handler");

//@des order new product
//@route post  /api/orders/new/order
//@access authorised user

exports.orderNewProduct = asyncHandler(async (req, res) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;
  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paidAt: Date.now(),
    user: req.user._id,
  });
  res.status(201).json({
    success:true,
    order
  })
});


//@des get single order details
//@route get /api/orders/me/:id
//@access authorised user

exports.getSingleOrderDetail=asyncHandler(async(req,res)=>{
    const order=await Order.findById(req.params.id)
    if(!order){
        res.status(400)
        throw new Error("Order not found")
    }
    res.status(200).json({
        success:true,
        order
    })
})


//@des get login user orders details
//@route get /api/orders/me/:id
//@access authorised user

exports.getAllOrderDetails=asyncHandler(async(req,res)=>{
    console.log(req.user.id)
    console.log(req.user._id)
    const orders=await Order.find({user:req.user.id})
    if(!orders){
        res.status(400)
        throw new Error("Order not found")
    }
    res.status(200).json({
        success:true,
        orders
    })
})



//@des get all user orders details
//@route get /api/orders/admin/usersOrders
//@access authorised by admin

exports.getAllUserOrderDetails=asyncHandler(async(req,res)=>{
    const orders=await Order.find()
    if(!orders){
        res.status(400)
        throw new Error("No order by any user")
    }
    let totalAmount = 0;

    orders.forEach((order) => {
      totalAmount += order.totalPrice;
    });
  
    res.status(200).json({
      success: true,
      totalAmount,
      orders,
    });
})

//@des update Order status
//@route get /api/orders/updateOrder/:id
//@access authorised by admin
exports.updateOrder=asyncHandler(async(req,res)=>{
    const order=await Order.findById(req.params.id)
    if(!order){
        res.status(400)
        throw new Error("Order not found with this id")
    }
    if(order.orderStatus==="Delivered"){
        res.status(400)
        throw new Error("You have already delivered this order")
    }
    if(req.body.status==="Shipped"){
        order.orderItems.forEach(async (ord)=>{
      await updateStock(ord.product,ord.quantity)
        })
    }
order.orderStatus=req.body.status
if(req.body.status==="Delivered"){
    order.deliveredAt=Date.now()
}

await order.save({validateBeforeSave:false})

res.status(200).json({
    success:true
})

})

async function updateStock(id,quantity){
    const product=await Product.findById(id);
    product.stock-=quantity
    await product.save({validateBeforeSave:false})
}

//@des delete Order 
//@route get /api/orders/deleteOrder/:id
//@access authorised by admin
exports.deleteOrder=asyncHandler(async(req,res)=>{
    const order=await Order.findById(req.params.id)
    if(!order){
        res.status(400)
        throw new Error("Order not found")
    }
    await order.remove()
    res.status(200).json({
        success:true
    })
})