import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Shield, LogOut } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout, switchRole } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="container max-w-2xl py-8">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {user?.name ? getInitials(user.name) : 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">{user?.name}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Mail className="h-4 w-4" />
                {user?.email}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Role</span>
            </div>
            <Badge variant={user?.role === 'STAFF' ? 'default' : 'secondary'}>
              {user?.role}
            </Badge>
          </div>

          <Separator />

          {/* Demo Role Switcher */}
          <div className="rounded-lg bg-muted p-4">
            <h4 className="text-sm font-medium mb-3">Demo Controls</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Switch between roles to explore different views
            </p>
            <div className="flex gap-2">
              <Button
                variant={user?.role === 'STUDENT' ? 'default' : 'outline'}
                size="sm"
                onClick={() => switchRole('STUDENT')}
              >
                <User className="h-4 w-4 mr-2" />
                Student View
              </Button>
              <Button
                variant={user?.role === 'STAFF' ? 'default' : 'outline'}
                size="sm"
                onClick={() => switchRole('STAFF')}
              >
                <Shield className="h-4 w-4 mr-2" />
                Staff View
              </Button>
            </div>
          </div>

          <Separator />

          <Button variant="destructive" className="w-full" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
