# Account Type Toggle - Visual Guide

## What It Looks Like

The toggle appears at the top of both Login and Register pages.

### Visual Layout

```
┌─────────────────────────────────────┐
│                                     │
│     Welcome to MedAssist AI         │
│     Please login to continue        │
│                                     │
│  ┌─────────────┬─────────────────┐  │
│  │  👤 User    │  🏢 Health      │  │
│  │             │    Centre       │  │
│  └─────────────┴─────────────────┘  │
│                                     │
│  [Error message if any]             │
│                                     │
│  Email: ____________________        │
│  Password: ________________         │
│  [Login Button]                     │
│                                     │
└─────────────────────────────────────┘
```

## Toggle States

### User Selected (Default)
```
┌──────────────────────────────┐
│ ┌────────────┐ ┌──────────┐  │
│ │ 👤 User    │ │ 🏢 HC    │  │
│ │ (ACTIVE)   │ │(inactive)│  │
│ └────────────┘ └──────────┘  │
└──────────────────────────────┘

Style:
- Background: Primary color (blue)
- Text: White
- Shadow: Visible
- Icon: UserIcon
```

### Health Centre Selected
```
┌──────────────────────────────┐
│ ┌────────────┐ ┌──────────┐  │
│ │ 👤 User    │ │ 🏢 HC    │  │
│ │(inactive)  │ │ (ACTIVE) │  │
│ └────────────┘ └──────────┘  │
└──────────────────────────────┘

Style:
- Background: Primary color (blue)
- Text: White
- Shadow: Visible
- Icon: BuildingIcon
```

## How It Works

### Step 1: User Visits Login Page
```
Browser: /en/login
        ↓
Page loads with toggle set to "User" (default)
```

### Step 2: User Switches to Health Centre
```
User clicks "Health Centre" button
        ↓
Toggle state updates
        ↓
accountType = "health_centre"
```

### Step 3: User Submits Login
```
Form submission with role = "health_centre"
        ↓
Backend receives: {email, password, role: "health_centre"}
        ↓
Authentication successful
        ↓
Frontend receives user role confirmation
        ↓
Navigate to /en/admin-dashboard
```

## Component Anatomy

```tsx
<AccountTypeToggle>
  ├─ Left Button (User)
  │  ├─ Icon: UserIcon
  │  ├─ Text: "User" / "مستخدم"
  │  ├─ Active Style: Primary color background
  │  └─ Inactive Style: Gray background
  │
  └─ Right Button (Health Centre)
     ├─ Icon: BuildingIcon
     ├─ Text: "Health Centre" / "مركز صحي"
     ├─ Active Style: Primary color background
     └─ Inactive Style: Gray background
```

## Styling Details

### Colors
```css
Active State:
- Background: Primary color (cyan/blue)
- Text: White
- Shadow: Medium shadow

Inactive State:
- Background: Gray-100
- Text: Gray-700
- Shadow: None
```

### Transitions
```css
All changes animate smoothly:
- Background color transition
- Text color transition
- Shadow transition
Transition time: 0.2s
```

### Responsive
- Mobile: Full width toggle, buttons stack
- Desktop: Side-by-side buttons with icons

## RTL Support

When locale is 'ar' (Arabic), the component:
- Flips layout automatically
- Displays Arabic text:
  - "User" → "مستخدم"
  - "Health Centre" → "مركز صحي"
- Icons remain the same

## Code Integration

### In LoginPage
```tsx
const [accountType, setAccountType] = useState<AccountType>('user');

return (
  <div>
    <AccountTypeToggle 
      value={accountType}
      onChange={setAccountType}
      isRTL={isRTL}
    />
    <form onSubmit={handleSubmit}>
      {/* Login form */}
    </form>
  </div>
);
```

### Handling Selection
```tsx
const handleSubmit = async (e: React.FormEvent) => {
  // accountType is available and updated via toggle
  const response = await authApi.login({
    email,
    password,
    role: accountType  // ← Sent to backend
  });
};
```

## User Journey Map

```
              ┌─ Select "User" → Dashboard
              │
Login Page ───┤
              │
              └─ Select "Health Centre" → Admin Dashboard

              ┌─ Select "User" → Dashboard
              │
Register ─────┤
              │
              └─ Select "Health Centre" → Admin Dashboard
```

## Customization Points

### Change Colors
Edit `AccountTypeToggle.tsx`:
```tsx
className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
  value === 'user'
    ? 'bg-primary text-white shadow-md'      // ← Customize these
    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
}`}
```

### Change Icons
```tsx
import { YourIcon } from 'lucide-react';

<YourIcon className="h-4 w-4" />
```

### Change Text
```tsx
{isRTL ? 'كلمتك_بالعربية' : 'English Text'}
```

## Accessibility

The toggle:
- Uses semantic `<button>` elements
- Has clear visual states (color, shadow, icons)
- Supports keyboard navigation
- Has good contrast ratio
- Clear, readable text

## Testing the Toggle

1. Go to login page
2. Click toggle to switch between states
3. Notice the styling changes
4. Form still works with either selection
5. Different dashboards load based on selection

## Future Enhancements

Potential additions when admin features are built:
- Role-based navbar items
- Admin-specific menu options
- Different page layouts per role
- Role-based permissions
- Admin settings panel
