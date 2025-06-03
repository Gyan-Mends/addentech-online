import { useState, useEffect } from "react";
import { useNavigate } from "@remix-run/react";
import { Button, Card, CardBody, CardFooter } from "@nextui-org/react";
import { X, FileText, Calendar } from "lucide-react";

interface WeeklyUpdateReminderProps {
  currentWeek: number;
  currentYear: number;
  hasSubmittedUpdate: boolean;
}

const WeeklyUpdateReminder = ({ 
  currentWeek, 
  currentYear, 
  hasSubmittedUpdate 
}: WeeklyUpdateReminderProps) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const navigate = useNavigate();
  
  // Only show the reminder on Friday if no update has been submitted
  useEffect(() => {
    const checkIfShouldShowReminder = () => {
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0 = Sunday, 5 = Friday
      
      // Show reminder on Thursday and Friday if no update has been submitted
      if ((dayOfWeek === 4 || dayOfWeek === 5) && !hasSubmittedUpdate && !isDismissed) {
        setShowReminder(true);
      } else {
        setShowReminder(false);
      }
    };
    
    checkIfShouldShowReminder();
    
    // Check again every hour
    const interval = setInterval(checkIfShouldShowReminder, 3600000);
    return () => clearInterval(interval);
  }, [hasSubmittedUpdate, isDismissed]);
  
  if (!showReminder) return null;
  
  return (
    <Card className="mb-4 border-l-4 border-l-yellow-500">
      <CardBody className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-3">
            <Calendar className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-medium">Weekly Update Reminder</h3>
              <p className="text-gray-600">
                {hasSubmittedUpdate 
                  ? "You've already submitted your update for Week " + currentWeek
                  : "Please submit your weekly update for Week " + currentWeek + " by the end of Friday."}
              </p>
            </div>
          </div>
          <Button 
            isIconOnly 
            variant="light" 
            onClick={() => setIsDismissed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardBody>
      {!hasSubmittedUpdate && (
        <CardFooter className="px-4 py-2 flex justify-end gap-2 bg-yellow-50">
          <Button 
            variant="flat" 
            color="warning"
            startContent={<FileText className="h-4 w-4" />}
            onClick={() => navigate("/admin/weekly-updates")}
          >
            Submit Update
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default WeeklyUpdateReminder;
