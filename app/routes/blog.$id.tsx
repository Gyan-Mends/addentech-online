import { useState, useEffect } from "react";
import { Button, Input } from "@nextui-org/react";
import PublicLayout from "~/components/PublicLayout";

const Checkout = () => {
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const fetchCartItems = () => {
            const storedCarts = JSON.parse(localStorage.getItem("cart")) || [];
            setCartItems(storedCarts);

            const totalAmount = storedCarts.reduce(
                (sum, item) => sum + parseFloat(item.price) * item.quantity,
                0
            );
            setTotal(totalAmount.toFixed(2));
        };

        fetchCartItems();
    }, []);

    const handleCheckout = () => {
        localStorage.removeItem("cart");
        setCartItems([]);
        alert("Checkout successful!");
    };

    return (
        <PublicLayout>
            <div className="container mx-auto mt-10">
                <h2 className="text-3xl font-bold mb-6">Checkout</h2>
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Cart Summary */}
                    <CartSummary cartItems={cartItems} total={total} />

                    {/* User Details */}
                    <UserDetailsForm
                        onCheckout={handleCheckout}
                        isCheckoutDisabled={cartItems.length === 0}
                    />
                </div>
            </div>
        </PublicLayout>
    );
};

const CartSummary = ({ cartItems, total }) => {
    return (
        <div>
            <h3 className="text-2xl font-semibold mb-4">Your Cart</h3>
            {cartItems.length > 0 ? (
                <div className="space-y-4">
                    {cartItems.map((item, index) => (
                        <CartItem key={index} item={item} />
                    ))}
                </div>
            ) : (
                <p>Your cart is empty.</p>
            )}
            <h3 className="text-xl font-bold mt-6">Total: ${total}</h3>
        </div>
    );
};

const CartItem = ({ item }) => {
    return (
        <div className="flex items-center justify-between border p-4 rounded-md">
            <div className="flex items-center gap-4">
                <img
                    src={item.image}
                    alt={item.name}
                    className="h-16 w-16 object-cover rounded"
                />
                <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-gray-600">Quantity: {item.quantity}</p>
                </div>
            </div>
            <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
        </div>
    );
};

const UserDetailsForm = ({ onCheckout, isCheckoutDisabled }) => {
    return (
        <div>
            <h3 className="text-2xl font-semibold mb-4">Shipping Details</h3>
            <div className="space-y-4">
                <Input label="Full Name" placeholder="Enter your full name" fullWidth />
                <Input
                    label="Email"
                    placeholder="Enter your email"
                    type="email"
                    fullWidth
                />
                <Input
                    label="Address"
                    placeholder="Enter your address"
                    fullWidth
                />
                <Input
                    label="Phone"
                    placeholder="Enter your phone number"
                    type="tel"
                    fullWidth
                />

                <Button
                    color="primary"
                    className="mt-6 w-full"
                    onClick={onCheckout}
                    disabled={isCheckoutDisabled}
                >
                    Proceed to Pay
                </Button>
            </div>
        </div>
    );
};

export default Checkout;
