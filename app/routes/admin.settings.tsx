import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { useState } from "react";
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Input,
    Spinner,
    Divider,
    Avatar,
} from "@nextui-org/react";
import { User, Mail, Phone, Building, Calendar, Key, Eye, EyeOff } from "lucide-react";
import AdminLayout from "~/layout/adminLayout";
import { getSession } from "~/session";
import Registration from "~/modal/registration";
import bcrypt from "bcryptjs";

interface UserProfile {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    department: string;
    role: string;
    dateJoined: string;
    profileImage?: string;
}

interface ActionData {
    success?: boolean;
    error?: string;
    message?: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
    const session = await getSession(request.headers.get('Cookie'));
    const userEmail = session.get('email');

    if (!userEmail) {
        throw new Response('Unauthorized', { status: 401 });
    }

    try {
        const user = await Registration.findOne({ email: userEmail }).populate('department');
        
        if (!user) {
            throw new Response('User not found', { status: 404 });
        }

        // Get department name
        let departmentName = 'Unknown Department';
        if (user.department && typeof user.department === 'object' && 'name' in user.department) {
            departmentName = (user.department as any).name;
        }

        const userProfile: UserProfile = {
            _id: user._id.toString(),
            name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'Unknown User',
            email: user.email,
            phone: user.phone || '',
            department: departmentName,
            role: user.role || 'staff',
            dateJoined: (user as any).createdAt ? new Date((user as any).createdAt).toLocaleDateString() : 'Unknown',
            profileImage: user.image || ''
        };

        return json({ userProfile });
    } catch (error) {
        console.error('Error loading user profile:', error);
        throw new Response('Internal Server Error', { status: 500 });
    }
}

export async function action({ request }: ActionFunctionArgs) {
    const session = await getSession(request.headers.get('Cookie'));
    const userEmail = session.get('email');

    if (!userEmail) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const action = formData.get('action') as string;

    try {
        if (action === 'updateProfile') {
            const name = formData.get('name') as string;
            const phone = formData.get('phone') as string;

            if (!name?.trim()) {
                return json({ error: 'Name is required' });
            }

            // Split full name into firstName and lastName
            const nameParts = name.trim().split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ') || firstName;

            await Registration.updateOne(
                { email: userEmail },
                { 
                    $set: { 
                        firstName,
                        lastName,
                        phone: phone?.trim() || ''
                    } 
                }
            );

            return json({ success: true, message: 'Profile updated successfully' });
        }

        if (action === 'changePassword') {
            const currentPassword = formData.get('currentPassword') as string;
            const newPassword = formData.get('newPassword') as string;
            const confirmPassword = formData.get('confirmPassword') as string;

            if (!currentPassword || !newPassword || !confirmPassword) {
                return json({ error: 'All password fields are required' });
            }

            if (newPassword !== confirmPassword) {
                return json({ error: 'New passwords do not match' });
            }

            if (newPassword.length < 6) {
                return json({ error: 'New password must be at least 6 characters long' });
            }

            // Get current user with password
            const user = await Registration.findOne({ email: userEmail });
            if (!user) {
                return json({ error: 'User not found' });
            }

            // Verify current password
            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

            if (!isCurrentPasswordValid) {
                return json({ error: 'Current password is incorrect' });
            }

            // Hash new password
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);

            // Update password
            await Registration.updateOne(
                { email: userEmail },
                { 
                    $set: { 
                        password: hashedNewPassword
                    } 
                }
            );

            return json({ success: true, message: 'Password changed successfully' });
        }

        return json({ error: 'Invalid action' });
    } catch (error) {
        console.error('Error in settings action:', error);
        return json({ error: 'An error occurred while updating settings' });
    }
}

export default function Settings() {
    const { userProfile } = useLoaderData<typeof loader>();
    const actionData = useActionData<ActionData>();
    const navigation = useNavigation();
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const isSubmitting = navigation.state === "submitting";
    const isUpdatingProfile = navigation.formData?.get('action') === 'updateProfile';
    const isChangingPassword = navigation.formData?.get('action') === 'changePassword';

    return (
        <AdminLayout>
            <div className="container mx-auto p-6 max-w-4xl">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
                </div>

                {actionData?.success && (
                    <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
                        {actionData.message}
                    </div>
                )}

                {actionData?.error && (
                    <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
                        {actionData.error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Profile Information Card */}
                    <Card className="shadow-md">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                                <Avatar
                                    src={userProfile.profileImage}
                                    name={userProfile.name}
                                    size="lg"
                                    className="text-pink-500"
                                />
                                <div>
                                    <h2 className="text-xl font-semibold">Profile Information</h2>
                                    <p className="text-gray-600 text-sm">Update your personal details</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardBody>
                            <Form method="post">
                                <input type="hidden" name="action" value="updateProfile" />
                                
                                <div className="space-y-4">
                                    <Input
                                        name="name"
                                        label="Full Name"
                                        defaultValue={userProfile.name}
                                        startContent={<User className="h-4 w-4 text-pink-500" />}
                                        variant="bordered"
                                        required
                                    />

                                    <Input
                                        name="email"
                                        label="Email Address"
                                        defaultValue={userProfile.email}
                                        startContent={<Mail className="h-4 w-4 text-pink-500" />}
                                        variant="bordered"
                                        disabled
                                        description="Email cannot be changed"
                                    />

                                    <Input
                                        name="phone"
                                        label="Phone Number"
                                        defaultValue={userProfile.phone}
                                        startContent={<Phone className="h-4 w-4 text-pink-500" />}
                                        variant="bordered"
                                        placeholder="Enter your phone number"
                                    />

                                    <Input
                                        label="Department"
                                        value={userProfile.department}
                                        startContent={<Building className="h-4 w-4 text-pink-500" />}
                                        variant="bordered"
                                        disabled
                                        description="Department is managed by administrators"
                                    />

                                    <Input
                                        label="Role"
                                        value={userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)}
                                        startContent={<User className="h-4 w-4 text-pink-500" />}
                                        variant="bordered"
                                        disabled
                                        description="Role is managed by administrators"
                                    />

                                    <Input
                                        label="Date Joined"
                                        value={userProfile.dateJoined}
                                        startContent={<Calendar className="h-4 w-4 text-pink-500" />}
                                        variant="bordered"
                                        disabled
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    color="primary"
                                    className="mt-6 bg-pink-500 hover:bg-pink-600"
                                    disabled={isSubmitting}
                                    fullWidth
                                >
                                    {isUpdatingProfile ? (
                                        <>
                                            <Spinner size="sm" className="mr-2" />
                                            Updating Profile...
                                        </>
                                    ) : (
                                        "Update Profile"
                                    )}
                                </Button>
                            </Form>
                        </CardBody>
                    </Card>

                    {/* Change Password Card */}
                    <Card className="shadow-md">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-pink-100 rounded-full">
                                    <Key className="h-5 w-5 text-pink-500" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold">Change Password</h2>
                                    <p className="text-gray-600 text-sm">Update your account password</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardBody>
                            <Form method="post">
                                <input type="hidden" name="action" value="changePassword" />
                                
                                <div className="space-y-4">
                                    <Input
                                        name="currentPassword"
                                        label="Current Password"
                                        type={showCurrentPassword ? "text" : "password"}
                                        variant="bordered"
                                        required
                                        endContent={
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                className="focus:outline-none"
                                            >
                                                {showCurrentPassword ? (
                                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                                ) : (
                                                    <Eye className="h-4 w-4 text-gray-400" />
                                                )}
                                            </button>
                                        }
                                    />

                                    <Input
                                        name="newPassword"
                                        label="New Password"
                                        type={showNewPassword ? "text" : "password"}
                                        variant="bordered"
                                        required
                                        description="Password must be at least 6 characters long"
                                        endContent={
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="focus:outline-none"
                                            >
                                                {showNewPassword ? (
                                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                                ) : (
                                                    <Eye className="h-4 w-4 text-gray-400" />
                                                )}
                                            </button>
                                        }
                                    />

                                    <Input
                                        name="confirmPassword"
                                        label="Confirm New Password"
                                        type={showConfirmPassword ? "text" : "password"}
                                        variant="bordered"
                                        required
                                        endContent={
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="focus:outline-none"
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                                ) : (
                                                    <Eye className="h-4 w-4 text-gray-400" />
                                                )}
                                            </button>
                                        }
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    color="primary"
                                    className="mt-6 bg-pink-500 hover:bg-pink-600"
                                    disabled={isSubmitting}
                                    fullWidth
                                >
                                    {isChangingPassword ? (
                                        <>
                                            <Spinner size="sm" className="mr-2" />
                                            Changing Password...
                                        </>
                                    ) : (
                                        "Change Password"
                                    )}
                                </Button>
                            </Form>
                        </CardBody>
                    </Card>
                </div>

                {/* Security Information */}
                <Card className="mt-6 shadow-md">
                    <CardHeader>
                        <h3 className="text-lg font-semibold">Security Information</h3>
                    </CardHeader>
                    <CardBody>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="font-medium text-gray-700">Account Status</p>
                                <p className="text-green-600">Active</p>
                            </div>
                            <div>
                                <p className="font-medium text-gray-700">Last Login</p>
                                <p className="text-gray-600">Today</p>
                            </div>
                            <div>
                                <p className="font-medium text-gray-700">Account Type</p>
                                <p className="text-gray-600 capitalize">{userProfile.role}</p>
                            </div>
                            <div>
                                <p className="font-medium text-gray-700">Two-Factor Authentication</p>
                                <p className="text-gray-500">Not enabled</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </AdminLayout>
    );
} 